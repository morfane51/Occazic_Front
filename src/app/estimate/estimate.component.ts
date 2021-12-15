import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Cat {
  _id: string;
  name: string;
}

interface Input_temp {
  _id: string;
  name: string;
  array: boolean;
  category: string;
}

interface Input {
  _id: string;
  name: string;
  array: boolean;
  category: string;
}

interface Input_array_temp {
  _id: string
  name: string;
  val_func_id: string;
}

interface Input_array {
  _id: string
  name: string;
  val_func_id: string;
}

interface Post_lists {
}

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})


export class EstimateComponent implements OnInit {

  productFormGroup: FormGroup;
  inputFormGroup: FormGroup;
  donneeFormGroup: FormGroup;

  isEditable = false;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  catList: Cat[] = [];

  inputLists: Input[] = [];
  inputLists_temp: Input_temp[] = [];

  input_array_Lists: Input_array[] = [];
  input_array_Lists_temp: Input_array_temp[] = [];

  post_Lists: Post_lists[] = [];

  private _catListUrl = 'http://localhost:3000/category';
  private _inputListUrl = 'http://localhost:3000/val_func';
  private _input_array_ListUrl = 'http://localhost:3000/array_val';


  constructor(private _formBuilder: FormBuilder, private _httpClient: HttpClient) {}

  ngOnInit(){
    this._httpClient.get<Cat[]>(this._catListUrl).subscribe(data => {
      this.catList = data;
    })
    this._httpClient.get<Input_temp[]>(this._inputListUrl).subscribe(data => {
      this.inputLists_temp = data;
    })
    this._httpClient.get<Input_array_temp[]>(this._input_array_ListUrl).subscribe(data => {
      this.input_array_Lists_temp = data;
    })

    this.productFormGroup = this._formBuilder.group({
      category: ['', Validators.required],
      ref_product: ['', Validators.required],

    });

    this.inputFormGroup = this._formBuilder.group({
      input: this._formBuilder.array([]),
    });

    this.donneeFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      mail: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  sendEstim(){
    const body = { title: 'Angular POST Request Example' };
    this._httpClient.post<Post_lists[]>('http://localhost:3000/price_estim', body).subscribe(data => {
      this.post_Lists = data;
      console.log(data)
    });
  }

  selectInput() {
    for (let input of this.inputLists_temp) {
      if (this.productFormGroup.value.category == input.category) {
        console.log(input);
        this.inputLists.push(input);
        this.addInput(input._id)
      }

    }
  }

  selectInputOption() {
    for (let input of this.inputLists) {
      if (input.array){
        for (let input_option of this.input_array_Lists_temp){
          if ( input._id == input_option.val_func_id) {
            console.log(input_option);
            this.input_array_Lists.push(input_option);
          }
        }
      }
    }
  }

  submitCat() {
    if (!this.productFormGroup.valid) {
      return;
    }
    console.log(this.productFormGroup.value.category);
    this.selectInput()
    console.log(this.inputLists);
    console.log(this.inputLists_temp);
    this.selectInputOption()
    console.log(this.input_array_Lists);
    console.log(this.input_array_Lists_temp);

      }

  submitInt(){
    if (!this.inputFormGroup.valid) {
      return;
    }
    console.log(this.inputFormGroup.value);

  }

  submitDon(){
    if (!this.donneeFormGroup.valid) {
      return;
    }
    console.log(this.donneeFormGroup.value);
    this.sendEstim()
  }

  get input(): FormArray {
    return this.inputFormGroup.get('input') as FormArray;
  }

  addInput(_id: string){
    const inputForm = this._formBuilder.group({
      id: _id,
      value: ['', Validators.required]
      });
    this.input.push(inputForm)
  }


}
