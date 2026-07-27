<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE commissions MODIFY COLUMN type ENUM(
            'platform_service_fee',
            'institution_commission',
            'agency_processing_fee',
            'lead_unlock_fee',
            'b2b_profit_share',
            'affiliate_associate',
            'affiliate_global_partner',
            'referral_sourcing_fee',
            'student_referral'
        ) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE commissions MODIFY COLUMN type ENUM(
            'platform_service_fee',
            'institution_commission',
            'agency_processing_fee',
            'lead_unlock_fee',
            'b2b_profit_share',
            'affiliate_associate',
            'affiliate_global_partner',
            'referral_sourcing_fee'
        ) NOT NULL");
    }
};
