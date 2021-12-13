import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Cat {
  _id: string;
  name: string;
}

interface Input {
  _id: string;
  name: string;
  array: boolean;
  category: string;
}

interface Input_array {
  _id: string
  name: string;
  val_func_id: string;
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
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  catList: Cat[] = [];
  inputLists: Input[] = [];
  input_array_Lists: Input_array[] = [];

  cat_selected = '61901df3d458e1c870b345c9';

  private _catListUrl = 'http://localhost:3000/category';
  private _inputListUrl = 'http://localhost:3000/val_func';
  private _input_array_ListUrl = 'http://localhost:3000/array_val';


  constructor(private _formBuilder: FormBuilder, private _httpClient: HttpClient) {}

  ngOnInit(){
    this._httpClient.get<Cat[]>(this._catListUrl).subscribe(data => {
      this.catList = data;
    })
    this._httpClient.get<Input[]>(this._inputListUrl).subscribe(data => {
      this.inputLists = data;
    })
    this._httpClient.get<Input_array[]>(this._input_array_ListUrl).subscribe(data => {
      this.input_array_Lists = data;
    })

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
