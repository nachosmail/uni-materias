import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss']
})
export class ProfileModalComponent {

  @Input() show = false;

  @Input() email: string = "";
  @Input() fullName: string = "";

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ fullName: string }>();

  onSave() {
    this.save.emit({ fullName: this.fullName });
  }

  onClose() {
    this.close.emit();
  }
}
