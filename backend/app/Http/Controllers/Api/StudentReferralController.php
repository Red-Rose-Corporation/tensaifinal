<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentReferralController extends Controller
{
    /** Friends this student referred, with their real (locked-at-enrollment) commission if any. */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $referrals = User::where('referred_by', $userId)
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->paginate(20);

        $referrals->getCollection()->transform(function (User $u) use ($userId) {
            $lead = Lead::where('student_id', $u->id)->latest()->first();

            $commission = $lead
                ? Commission::where('lead_id', $lead->id)->where('payee_id', $userId)->first()
                : null;

            return [
                'id'                 => $u->id,
                'name'               => $u->name,
                'email'              => $u->email,
                'target_country'     => $lead?->target_country,
                'status'             => $lead?->status === 'enrolled' ? 'enrolled' : ($lead ? 'processing' : 'pending'),
                'created_at'         => $u->created_at,
                'commission_amount'  => $commission?->amount,
                'commission_status'  => $commission?->status,
            ];
        });

        return response()->json($referrals);
    }
}
