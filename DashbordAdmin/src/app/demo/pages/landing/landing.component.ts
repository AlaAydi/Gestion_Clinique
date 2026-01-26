import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { FeaturesSectionComponent } from '../features-section/features-section.component';
import { AboutSectionComponent } from '../about-section/about-section.component';
import { CtaSectionComponent } from '../cta-section/cta-section.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { NavbarComponent } from '../navbar/navbar.component';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    AboutSectionComponent,
    CtaSectionComponent,
    FooterComponent ] , 
   templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent  {

}
