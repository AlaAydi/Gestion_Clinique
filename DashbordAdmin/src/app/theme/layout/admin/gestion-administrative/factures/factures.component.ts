import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PatientService } from 'src/app/core/services/patient/patient.service';

@Component({
  selector: 'app-factures',
  standalone:true ,
imports: [NgClass, NgFor, NgIf ,CommonModule],
  templateUrl: './factures.component.html',
  styleUrl: './factures.component.scss'
})
export class FacturesComponent
implements OnInit {

  reclamations: any[] = [];
  selected: any = null;

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadReclamations();
  }

  loadReclamations() {
    this.patientService.getAllReclamations().subscribe(res => {
      this.reclamations = res;
    });
  }

  openDetails(r: any) {
    this.selected = r;
  }

  closeModal() {
    this.selected = null;
  }
}
