<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function create(User $user): bool
    {
        return $this->isOrganizer($user);
    }

    public function update(User $user, Event $event): bool
    {
        return $this->isOrganizer($user)
            && $event->communityOrganizer()->where('user_id', $user->id)->exists();
    }

    public function cancel(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }

    private function isOrganizer(User $user): bool
    {
        return $user->roles()->where('code', 'organizer')->exists();
    }
}
