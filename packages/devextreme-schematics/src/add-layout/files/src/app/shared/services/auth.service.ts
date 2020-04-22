import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class AuthService {
    loggedIn = true;
    prevPath: string;
    constructor(private router: Router) { }

    logIn(login: string, password: string) {
        this.loggedIn = true;
        this.router.navigate([this.prevPath]);
    }

    logOut() {
        this.loggedIn = false;
        this.router.navigate(['/login-form']);
    }

    get isLoggedIn() {
        return this.loggedIn;
    }
}

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const isLoggedIn = this.authService.isLoggedIn;
        const isLoginForm = route.routeConfig.path === 'login-form';

        if (isLoggedIn && isLoginForm) {
            this.authService.prevPath = '/'
            this.router.navigate(['/']);
            return false;
        }

        if (!isLoggedIn && !isLoginForm) {
            this.router.navigate(['/login-form']);
        }

        if (isLoggedIn) {
            this.authService.prevPath = route.routeConfig.path;
        }

        return isLoggedIn || isLoginForm;
    }
}
