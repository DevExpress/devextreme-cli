import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

const defaultPath = '/';

@Injectable()
export class AuthService {
    private _loggedIn: boolean = true;
    get loggedIn(): boolean {
        return this._loggedIn;
    }
    set loggedIn(value: boolean) {
        this._loggedIn = value;
    }

    private _lastAuthenticatedPath: string = defaultPath;
    public get lastAuthenticatedPath(): string {
        return this._lastAuthenticatedPath;
    }
    public set lastAuthenticatedPath(value: string) {
        this._lastAuthenticatedPath = value;
    }

    constructor(private router: Router) { }

    logIn(login: string, password: string) {
        this.loggedIn = true;
        this.router.navigate([this.lastAuthenticatedPath]);
    }

    logOut() {
        this.loggedIn = false;
        this.router.navigate(['/login-form']);
    }
}

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const isLoggedIn = this.authService.loggedIn;
        const isLoginForm = route.routeConfig.path === 'login-form';

        if (isLoggedIn && isLoginForm) {
            this.authService.lastAuthenticatedPath = defaultPath;
            this.router.navigate([defaultPath]);
            return false;
        }

        if (!isLoggedIn && !isLoginForm) {
            this.router.navigate(['/login-form']);
        }

        if (isLoggedIn) {
            this.authService.lastAuthenticatedPath = route.routeConfig.path;
        }

        return isLoggedIn || isLoginForm;
    }
}
