<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormTemplate extends Model
{
    protected $fillable = [
        'country', 'visa_type', 'name', 'intake_options', 'birth_date',
        'student_name', 'passport_no', 'educations',
        'is_active', 'status', 'notes',
        'admission_manager_name', 'admission_manager_phone', 'admission_manager_whatsapp',
        'direct_fee', 'agency_fee', 'fee_currency',
        'affiliate_commission_type', 'affiliate_commission_value',
    ];

    protected $casts = [
        'intake_options'             => 'array',
        'educations'                 => 'array',
        'is_active'                  => 'boolean',
        'direct_fee'                 => 'decimal:2',
        'agency_fee'                 => 'decimal:2',
        'affiliate_commission_value' => 'decimal:2',
    ];

    /** Fee that applies for a given submitter role ('agency' vs everything else). */
    public function feeFor(string $submittedByRole): ?string
    {
        return $submittedByRole === 'agency' ? $this->agency_fee : $this->direct_fee;
    }

    /** Affiliate commission amount computed against the direct fee (agency submissions never carry an affiliate). */
    public function affiliateCommissionAmount(): ?float
    {
        if ($this->affiliate_commission_value === null || $this->direct_fee === null) return null;

        return $this->affiliate_commission_type === 'flat'
            ? (float) $this->affiliate_commission_value
            : round((float) $this->direct_fee * (float) $this->affiliate_commission_value / 100, 2);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function fieldGroups(): HasMany
    {
        return $this->hasMany(FormFieldGroup::class)->orderBy('sort_order');
    }

    public function fieldGroupsCount(): HasMany
    {
        return $this->hasMany(FormFieldGroup::class);
    }

    public function activeFieldGroups(): HasMany
    {
        return $this->hasMany(FormFieldGroup::class)
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(FormTemplateField::class)->orderBy('sort_order');
    }

    public function activeFields(): HasMany
    {
        return $this->hasMany(FormTemplateField::class)
            ->where('is_active', true)
            ->orderBy('sort_order');
    }
}
