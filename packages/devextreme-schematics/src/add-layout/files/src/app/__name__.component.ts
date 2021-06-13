import { Component, HostBinding } from '@angular/core';
import { AuthService, ScreenService, AppInfoService } from './shared/services';

@Component({
  selector: '<%= prefix %>-root',
  templateUrl: './<%= name %>.component.html',
  styleUrls: ['./<%= name %>.component.scss']
})
export class <%= strings.classify(name) %>Component  {
  sizes = this.screen.sizes;
  @HostBinding('class') get getClass() {
    return Object.keys(this.sizes)
    .filter(cl => this.sizes)
    .join(' ');
  }

  constructor(private authService: AuthService, private screen: ScreenService, public appInfo: AppInfoService) { }

  isAuthenticated() {
    return this.authService.loggedIn;
  }
}
