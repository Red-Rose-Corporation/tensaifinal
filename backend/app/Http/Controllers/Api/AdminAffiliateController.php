<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffiliateManagedEntity;
use App\Models\AffiliateProfile;
use App\Models\Commission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAffiliateController extends Controller
{
    public function index(): JsonResponse
    {
        $affiliates = User::role('affiliate')
            ->with(['affiliateProfile.managedEntities'])
            ->latest()
            ->get()
            ->map(function ($u) {
                $u->setRelation('commissions', Commission::where('payee_id', $u->id)->get());
                return $this->format($u);
            });

        return response()->json($affiliates);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $request->validate(['status' => 'required|in:active,suspended,pending']);
        $user->update(['status' => $request->status]);
        $u = $user->fresh(['affiliateProfile.managedEntities']);
        $u->setRelation('commissions', Commission::where('payee_id', $u->id)->get());
        return response()->json($this->format($u));
    }

    public function markCommissionPaid(int $affiliateId, int $commissionId): JsonResponse
    {
        $commission = Commission::where('payee_id', $affiliateId)->findOrFail($commissionId);
        $commission->update(['status' => 'paid', 'paid_at' => now()]);
        return response()->json(['success' => true]);
    }

    public function markAllPaid(int $affiliateId): JsonResponse
    {
        Commission::where('payee_id', $affiliateId)
            ->whereIn('status', ['pending', 'due'])
            ->update(['status' => 'paid', 'paid_at' => now()]);
        return response()->json(['success' => true]);
    }

    /** Admin sets what this affiliate earns per conversion — local (per-student, flat) or global (per-enrollment, %). */
    public function updateRates(Request $request, int $id): JsonResponse
    {
        $profile = AffiliateProfile::where('user_id', $id)->firstOrFail();
        $data = $request->validate([
            'local_commission_fixed'    => 'nullable|numeric|min:0',
            'global_commission_percent' => 'nullable|numeric|min:0|max:100',
        ]);
        $profile->update($data);
        return response()->json(['success' => true, 'profile' => $profile->fresh()]);
    }

    /** Activate/suspend an institution or employee this Global affiliate declared as managed by them. */
    public function updateEntityStatus(Request $request, int $affiliateId, int $entityId): JsonResponse
    {
        $entity = AffiliateManagedEntity::where('affiliate_user_id', $affiliateId)->findOrFail($entityId);
        $data = $request->validate(['status' => 'required|in:active,inactive,suspended']);
        $entity->update($data);
        return response()->json(['success' => true, 'entity' => $entity->fresh()]);
    }

    private function format(User $u): array
    {
        // $u->affiliateProfile serializes with its eager-loaded managedEntities
        // relation included automatically (as `managed_entities`, snake_cased).
        return [
            'id'          => $u->id,
            'name'        => $u->name,
            'email'       => $u->email,
            'status'      => $u->status,
            'profile'     => $u->affiliateProfile,
            'commissions' => $u->commissions ?? [],
            'created_at'  => $u->created_at->toISOString(),
        ];
    }
}
