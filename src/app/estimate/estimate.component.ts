import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import {HttpClient} from '@angular/common/http';

interface Cat {
  _id: string;
  name: string;
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
  product_ref: string;
}

interface Input_value_lists {
  _id: string;
  product_category_id: string;
  product_ref: string;
}

interface Calcul_lists {
  _id: string;
  propose_price: string;
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

  catLists: Cat[] = [];

  inputLists: Input[] = [];
  inputLists_temp: Input_temp[] = [];

  input_array_Lists: Input_array[] = [];
  input_array_Lists_temp: Input_array_temp[] = [];

  estim_Lists: any;
  input_Value_Lists: any;
  calcul_Estim_Lists: any;

  category: string | undefined ;
  estimId: string | undefined ;
  proposePrice: number | undefined ;

  private _catListUrl = 'http://localhost:3000/category';
  private _inputListUrl = 'http://localhost:3000/val_func';
  private _input_array_ListUrl = 'http://localhost:3000/array_val';
  private _estimPostUrl = 'http://localhost:3000/price_estim';
  private _inputValueUrl = 'http://localhost:3000/input_func';
  private _calculEstimUrl = 'http://localhost:3000/calcul';

  constructor(private _formBuilder: FormBuilder, private _httpClient: HttpClient) {
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

  createEstim(cat: string, ref: string) {
    const body = {product_category_id: cat, product_ref: ref};
    this._httpClient.post<Estim_lists[]>(this._estimPostUrl, body).subscribe(data => {
      JSON.stringify(data);
      this.estim_Lists = data;
      this.estimId = this.estim_Lists._id;
    });

  }

  editEstim(name: string, surname: string, mail: string, phone: string) {
    const body = {name: name, surname: surname, mail: mail};
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
      this.proposePrice = this.calcul_Estim_Lists.propose_price
    });
  }

  submitCat() {
    if (!this.productFormGroup.valid) {
      return;
    }
    console.log(this.productFormGroup.value.category);
    this.category = this.productFormGroup.value.category;
    this.selectInput()
    console.log(this.inputLists);
    console.log(this.inputLists_temp);
    this.selectInputOption()
    console.log(this.input_array_Lists);
    console.log(this.input_array_Lists_temp);
    this.createEstim(this.productFormGroup.value.category, this.productFormGroup.value.ref_product)
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
      if (this.productFormGroup.value.category == input.category) {
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

  test(id: string){
    console.log('GOOD')
    console.log(id)
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
