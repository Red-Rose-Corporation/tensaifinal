<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_templates', function (Blueprint $table) {
            $table->decimal('direct_fee', 12, 2)->nullable()->after('status');
            $table->decimal('agency_fee', 12, 2)->nullable()->after('direct_fee');
            $table->string('fee_currency', 10)->default('BDT')->after('agency_fee');
            $table->enum('affiliate_commission_type', ['percentage', 'flat'])->default('percentage')->after('fee_currency');
            $table->decimal('affiliate_commission_value', 12, 2)->nullable()->after('affiliate_commission_type');
        });
    }

    public function down(): void
    {
        Schema::table('form_templates', function (Blueprint $table) {
            $table->dropColumn(['direct_fee', 'agency_fee', 'fee_currency', 'affiliate_commission_type', 'affiliate_commission_value']);
        });
    }
};
