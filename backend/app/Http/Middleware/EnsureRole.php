<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        abort_unless(
            $request->user()?->hasRole($role),
            Response::HTTP_FORBIDDEN,
            'No tienes permisos para realizar esta acción.',
        );

        return $next($request);
    }
}
