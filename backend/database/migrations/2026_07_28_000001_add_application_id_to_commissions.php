<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->foreignId('application_id')->nullable()->after('lead_id')
                ->constrained()->cascadeOnDelete();
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->foreignId('lead_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->dropForeign(['application_id']);
            $table->dropColumn('application_id');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->foreignId('lead_id')->nullable(false)->change();
        });
    }
};
