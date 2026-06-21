<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvitationRequest extends Model
{
    protected $fillable = [
        'user_id',
        'event_category_id',
        'status',
        'data',
        'admin_notes',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }
}
