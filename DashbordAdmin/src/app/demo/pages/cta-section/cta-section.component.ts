import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cta-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.css'
})
export class CtaSectionComponent {
  isSubmitting = false;

  formData = {
    name: '',
    email: '',
    phone: '',
    clinic: '',
    message: ''
  };

  onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Simulate form submission
    console.log('Form submitted:', this.formData);

    setTimeout(() => {
      alert('Merci ! Nous vous contacterons bientôt.');
      this.isSubmitting = false;
      this.resetForm();
    }, 1500);
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      clinic: '',
      message: ''
    };
  }
}
