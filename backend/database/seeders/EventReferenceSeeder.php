<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use App\Models\EventModality;
use App\Models\EventStatus;
use App\Models\Location;
use App\Models\RegistrationStatus;
use Illuminate\Database\Seeder;

class EventReferenceSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'workshop' => 'Workshop',
            'talk' => 'Talk',
            'hackathon' => 'Hackathon',
            'fair' => 'Fair',
            'cultural' => 'Cultural',
            'sports' => 'Sports',
        ] as $code => $name) {
            EventCategory::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }

        foreach ([
            'in_person' => 'In person',
            'virtual' => 'Virtual',
            'hybrid' => 'Hybrid',
        ] as $code => $name) {
            EventModality::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }

        foreach ([
            'Campus Gustavo Galindo',
            'Auditorio FIEC',
            'Aula A-101',
            'Google Meet',
        ] as $name) {
            Location::query()->updateOrCreate(['name' => $name]);
        }

        foreach ([
            'published' => 'Published',
            'cancelled' => 'Cancelled',
        ] as $code => $name) {
            EventStatus::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }

        foreach ([
            'active' => 'Active',
            'cancelled' => 'Cancelled',
        ] as $code => $name) {
            RegistrationStatus::query()->updateOrCreate(['code' => $code], ['name' => $name]);
        }
    }
}
