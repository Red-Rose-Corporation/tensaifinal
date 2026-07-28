<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Commission;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentReferralController extends Controller
{
    /** Friends this student referred: which service they bought (if any) and the real, locked-at-purchase commission. */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $referrals = User::where('referred_by', $userId)
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->paginate(20);

        $referrals->getCollection()->transform(function (User $u) use ($userId) {
            $lead = Lead::where('student_id', $u->id)->latest()->first();

            // Prefer the friend's furthest-along application (purchased service wins over a draft one).
            $application = Application::where('user_id', $u->id)
                ->with('formTemplate:id,name,country,visa_type')
                ->orderByDesc('live_to_school')
                ->latest()
                ->first();

            $commissions = collect();
            if ($lead || $application) {
                $commissions = Commission::where('payee_id', $userId)
                    ->where(function ($q) use ($lead, $application) {
                        if ($lead) $q->orWhere('lead_id', $lead->id);
                        if ($application) $q->orWhere('application_id', $application->id);
                    })
                    ->get();
            }

            $purchased = $lead?->status === 'enrolled' || (bool) $application?->live_to_school;
            $inProgress = $lead !== null || $application !== null;

            return [
                'id'                 => $u->id,
                'name'               => $u->name,
                'email'              => $u->email,
                'target_country'     => $application?->formTemplate?->country ?? $lead?->target_country,
                'service_name'       => $application?->formTemplate?->name,
                'status'             => $purchased ? 'enrolled' : ($inProgress ? 'processing' : 'pending'),
                'created_at'         => $u->created_at,
                'commission_amount'  => $commissions->isNotEmpty() ? $commissions->sum('amount') : null,
                'commission_status'  => $commissions->isEmpty() ? null : ($commissions->every(fn ($c) => $c->status === 'paid') ? 'paid' : 'due'),
            ];
        });

        return response()->json($referrals);
    }
}
