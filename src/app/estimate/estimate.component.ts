import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

interface Cat {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})
export class EstimateComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  threeFormGroup: FormGroup;
  isEditable = true;
  cat: Cat[] = [
    {value: 'Lampe-0', viewValue: 'Lampe'},
    {value: 'Enceinte-1', viewValue: 'Enceinte'},
    {value: 'Spot-2', viewValue: 'Spot'},
  ];

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(){
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
    this.threeFormGroup = this._formBuilder.group({
      threeCtrl: ['', Validators.required],
    });
  }


}
