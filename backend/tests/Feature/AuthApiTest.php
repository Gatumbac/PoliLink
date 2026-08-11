<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_with_the_student_role(): void
    {
        $this->seed();

        $this->csrfPost('/api/auth/register', [
            'first_name' => 'Ana',
            'last_name' => 'Torres',
            'email' => 'ana@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'ana@example.test')
            ->assertJsonPath('data.roles.0.code', 'student');

        $user = User::query()->where('email', 'ana@example.test')->sole();
        $this->assertTrue($user->roles()->where('code', 'student')->exists());
        $this->assertFalse($user->roles()->where('code', 'organizer')->exists());

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_registration_validates_unique_email_and_password_confirmation(): void
    {
        $this->seed();

        $this->csrfPost('/api/auth/register', [
            'first_name' => 'Ana',
            'last_name' => 'Torres',
            'email' => 'student@polilink.test',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_student_can_login_and_an_authenticated_user_can_read_me(): void
    {
        $this->seed();

        $this->csrfPost('/api/auth/login', [
            'email' => 'student@polilink.test',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('data.roles.0.code', 'student');

        $this->assertAuthenticated('web');

        $student = User::query()->where('email', 'student@polilink.test')->sole();
        $this->actingAs($student, 'web')
            ->statefulGet('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $student->id);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $this->seed();
        $student = User::query()->where('email', 'student@polilink.test')->sole();

        $this->actingAs($student, 'web')
            ->csrfDelete('/api/auth/logout')
            ->assertNoContent();

        $this->assertGuest('web');
    }

    public function test_login_rejects_invalid_credentials_and_throttles_attempts(): void
    {
        $this->seed();
        $payload = [
            'email' => 'student@polilink.test',
            'password' => 'incorrect-password',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->csrfPost('/api/auth/login', $payload)->assertUnauthorized();
        }

        $this->csrfPost('/api/auth/login', $payload)->assertTooManyRequests();
    }

    public function test_csrf_cookie_endpoint_is_available(): void
    {
        $this->get('/sanctum/csrf-cookie')
            ->assertNoContent()
            ->assertCookie('XSRF-TOKEN');
    }

    private function csrfPost(string $uri, array $payload)
    {
        return $this->stateful()
            ->withSession(['_token' => 'test-csrf-token'])
            ->withHeader('X-CSRF-TOKEN', 'test-csrf-token')
            ->postJson($uri, $payload);
    }

    private function csrfDelete(string $uri)
    {
        return $this->stateful()
            ->withSession(['_token' => 'test-csrf-token'])
            ->withHeader('X-CSRF-TOKEN', 'test-csrf-token')
            ->deleteJson($uri);
    }

    private function statefulGet(string $uri)
    {
        return $this->stateful()->getJson($uri);
    }

    private function stateful()
    {
        return $this
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/');
    }
}
