import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { DxHttpModule } from 'devextreme-angular/http';
import { SideNavOuterToolbarComponent, SideNavInnerToolbarComponent } from './layouts';
import { FooterComponent } from './shared/components';
import { UnauthenticatedContentComponent } from './unauthenticated-content';


@Component({
  selector: '<%= prefix %>-root',
  templateUrl: './<%= name %>.component.html',
  styleUrls: ['./<%= name %>.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    CommonModule,
    DxHttpModule,
    SideNavOuterToolbarComponent,
    SideNavInnerToolbarComponent,
    FooterComponent,
    UnauthenticatedContentComponent,
  ],
  providers: []
})
export class <%= strings.classify(name) %>Component  {
  @HostBinding('class') get getClass() {
    const sizeClassName = Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
    return `${sizeClassName} app` ;
  }

  constructor(private authService: AuthService, private screen: ScreenService, public appInfo: AppInfoService) { }

  isAuthenticated() {
    return this.authService.loggedIn;
  }
}
