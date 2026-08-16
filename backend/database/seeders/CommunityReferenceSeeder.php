<?php

namespace Database\Seeders;

use App\Models\CommunityCreationRequestStatus;
use App\Models\CommunityRole;
use App\Models\MembershipStatus;
use Illuminate\Database\Seeder;

class CommunityReferenceSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'member' => 'Miembro',
            'organizer' => 'Organizador',
            'tutor' => 'Tutor',
        ] as $code => $name) {
            CommunityRole::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }

        foreach ([
            'pending' => 'Pendiente',
            'active' => 'Activa',
            'rejected' => 'Rechazada',
            'left' => 'Retirada',
        ] as $code => $name) {
            MembershipStatus::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }

        foreach ([
            'pending' => 'Pendiente',
            'approved' => 'Aprobada',
            'rejected' => 'Rechazada',
        ] as $code => $name) {
            CommunityCreationRequestStatus::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }
    }
}
