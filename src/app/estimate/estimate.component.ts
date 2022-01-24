import {Component, OnInit, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {StepperOrientation} from "@angular/cdk/stepper";
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {MatStepper} from "@angular/material/stepper";


interface Cat {
  _id: string;
  name: string;
  marge: number;
  picture: string;
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
  _id: string;
  name: string;
  val_func_id: string;
  value: number;
}

interface Input_array {
  _id: string;
  name: string;
  val_func_id: string;
  value: number;
}

interface Estim_lists {
  _id: string;
  product_category_id: string;
}

interface Input_value_lists {
  _id: string;
  product_category_id: string;
  product_ref: string;
}

interface Calcul_lists {
  _id: string;
  propose_price: number;
  marge: number;
}

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})

export class EstimateComponent implements OnInit {

  inputFormGroup: FormGroup;
  donneeFormGroup: FormGroup;

  isEditable = false;
  isCompleted = false;
  orient_vert: StepperOrientation = 'vertical';
  orient_hori: StepperOrientation = 'horizontal';
  orientation: StepperOrientation ;

  catSelected: string;
  catIsSelect = true;
  cardId: number;

  defaultElevation = 2;
  raisedElevation = 8;

  catLists: Cat[] = [];

  inputLists: Input[] = [];
  inputLists_temp: Input_temp[] = [];

  input_array_Lists: Input_array[] = [];
  input_array_Lists_temp: Input_array_temp[] = [];

  estim_Lists: any;
  input_Value_Lists: any;
  calcul_Estim_Lists: any;

  categoryId: string | undefined ;
  estimId: string | undefined ;
  price_up: number | undefined ;
  price_down: number | undefined ;

  private _catListUrl = 'http://localhost:3000/category';
  private _inputListUrl = 'http://localhost:3000/val_func';
  private _input_array_ListUrl = 'http://localhost:3000/array_val';
  private _estimPostUrl = 'http://localhost:3000/price_estim';
  private _inputValueUrl = 'http://localhost:3000/input_func';
  private _calculEstimUrl = 'http://localhost:3000/calcul';

  @ViewChild('stepper') stepper: MatStepper;

  constructor(public breakpointObserver: BreakpointObserver, private _formBuilder: FormBuilder, private _httpClient: HttpClient) {
  }

  ngOnInit() {
    this._httpClient.get<Cat[]>(this._catListUrl).subscribe(data => {
      this.catLists = data;
    })
    this._httpClient.get<Input_temp[]>(this._inputListUrl).subscribe(data => {
      this.inputLists_temp = data;
    })
    this._httpClient.get<Input_array_temp[]>(this._input_array_ListUrl).subscribe(data => {
      this.input_array_Lists_temp = data;
    })

    this.inputFormGroup = this._formBuilder.group({
      input: this._formBuilder.array([]),
    });

    this.donneeFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.min(9)]]
    });

    this.breakpointObserver
      .observe(['(max-width: 1300px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.orientation = this.orient_vert;
        } else {
          this.orientation = this.orient_hori;
        }
      });
  }

  selectCat(cat_id: string, cardId: number) {
    this.catSelected = cat_id;
    this.catIsSelect = false;
    this.cardId = cardId;
  }

  // @ts-ignore
  focusCardStyle(cardId: number){
    const style = "outline: 3px solid #3f51b5;";
    if(cardId == this.cardId){
      return style;
    }
  }

  validCatSelect(cat_id: string){
    if (cat_id == null) {
      console.log('vide');
      return;
    }
    // @ts-ignore
    this.stepper.selected.completed = true;
    this.stepper.next();
    console.log(cat_id);
    this.categoryId = cat_id;
    this.selectInput()
    console.log(this.inputLists);
    console.log(this.inputLists_temp);
    this.selectInputOption()
    console.log(this.input_array_Lists);
    console.log(this.input_array_Lists_temp);
    this.createEstim(cat_id)
  }

  createEstim(cat_id: string) {
    const body = {product_category_id: cat_id};
    this._httpClient.post<Estim_lists[]>(this._estimPostUrl, body).subscribe(data => {
      JSON.stringify(data);
      this.estim_Lists = data;
      this.estimId = this.estim_Lists._id;
    });

  }

  editEstim(name: string, surname: string, mail: string, phone: string, calcul?: string) {
    const body = {name: name, surname: surname, mail: mail, calcul_id: calcul};
    this._httpClient.put<Estim_lists[]>(this._estimPostUrl + '/' + this.estimId, body).subscribe(data => {
      this.estim_Lists = data;
      console.log(data)
    });
  }

  sendInputValue(id: string, value: string) {
    const body = {price_estimate_id: this.estimId, val_func_id: id, value: value};
    this._httpClient.post<Input_value_lists[]>(this._inputValueUrl, body).subscribe(data => {
      JSON.stringify(data);
      this.input_Value_Lists = data;
      console.log(data)
    });
  }

  calculEstim(){
    const body = {price_estimID: this.estimId};
    this._httpClient.post<Calcul_lists[]>(this._calculEstimUrl, body).subscribe(data => {
      JSON.stringify(data);
      this.calcul_Estim_Lists = data;
      console.log(data)
      let price_up_temp: number;
      let price_down_temp: number;
      let price = this.calcul_Estim_Lists.propose_price ;
      let marge = this.calcul_Estim_Lists.marge;
      let percentage_price = Math.floor( marge / price * 100);
      price_up_temp = Math.floor(price + percentage_price);
      price_down_temp = Math.floor(price - percentage_price);
      if (price_down_temp < 1){
        this.price_down = 1;
      }
      this.price_up = price_up_temp;
      if (price_up_temp < 1){
        this.price_down = 0;
        this.price_up = 0;
      }
      this.editEstim(this.estim_Lists.name, this.estim_Lists.surname, this.estim_Lists.mail, this.estim_Lists.phone, this.calcul_Estim_Lists._id)
    });
  }

  submitInt() {
    console.log(this.inputFormGroup.value);
    for (let value of this.inputFormGroup.value.input) {
      this.sendInputValue(value.id, value.value);
    }
  }

  submitDon() {
    if (!this.donneeFormGroup.valid) {
      return;
    }
    console.log(this.donneeFormGroup.value);
    this.editEstim(this.donneeFormGroup.value.name, this.donneeFormGroup.value.surname, this.donneeFormGroup.value.mail, this.donneeFormGroup.value.phone);
    this.calculEstim();
  }

  selectInput() {
    for (let input of this.inputLists_temp) {
      if (this.categoryId == input.category) {
        console.log(input);
        this.inputLists.push(input);
        this.addInput(input._id);
      }

    }
  }

  selectInputOption() {
    for (let input of this.inputLists) {
      if (input.array) {
        for (let input_option of this.input_array_Lists_temp) {
          if (input._id == input_option.val_func_id) {
            console.log(input_option);
            this.input_array_Lists.push(input_option);
          }
        }
      }
    }
  }

  get input(): FormArray {
    return this.inputFormGroup.get('input') as FormArray;
  }

  addInput(_id: string) {
    const inputForm = this._formBuilder.group({
      id: _id,
      value: ['', Validators.required]
    });
    this.input.push(inputForm);
  }

}
