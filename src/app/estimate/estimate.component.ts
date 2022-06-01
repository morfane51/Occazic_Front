import {Component, OnInit, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidatorFn, AbstractControl} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {StepperOrientation} from "@angular/cdk/stepper";
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {MatStepper} from "@angular/material/stepper";
import {Cat, FrontDataService, Input_array, Input_array_temp, Input, Root_Cat, Input_value} from "../data.service";
import {environment} from "../../environments/environment";
import {map, Observable, startWith} from "rxjs";

// Validator function for force user to use value in select
function autocompleteValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css'],
  providers: [FrontDataService]
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

  rootCatSelected: string;
  rootCatIsSelect = true;
  rootCatCardId: number;

  defaultElevation = 2;
  raisedElevation = 8;

  rootCatLists: Root_Cat[] = [];
  catLists: Cat[] | undefined = [];

  inputLists: Input[] = [];
  inputLists_temp: Input[] | undefined = [];

  input_array_Lists: Input_array[] = [];
  input_array_Lists_temp: Input_array_temp[] | undefined = [];

  input_array_Lists_Option: Observable<Input_array[]>[] = [];

  estim_Lists: any;
  input_Value_Lists: any;
  calcul_Estim_Lists: any;

  rootCategoryId: string | undefined ;
  categoryId: string | undefined ;
  inputValueLists: Input_value[] = [];

  estimId: string;
  price_up: number | undefined ;
  price_down: number | undefined ;
  index_temp_autocomplete: number | undefined ;

  apiURL = environment.apiURL;

  @ViewChild('stepper') stepper: MatStepper;

  constructor(public breakpointObserver: BreakpointObserver, private _formBuilder: FormBuilder, private _httpClient: HttpClient, private dataSrv: FrontDataService) {
  }

  ngOnInit() {

    this.dataSrv.getRootCategoryData().subscribe(data => {
      this.rootCatLists = data;
    })

    this.getInputFuncData();

    this.getArrayFuncData();

    this.inputFormGroup = this._formBuilder.group({
      input: this._formBuilder.array([]),
    });

    this.donneeFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      //phone: ['', [Validators.required, Validators.min(9)]]
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

  // For Load Autocomplete select
  AddSelectAuto(index: number){
    if (this.index_temp_autocomplete !== index){
      this.LoadSelectAuto(index);
      this.index_temp_autocomplete = index;
    }else{
      this.index_temp_autocomplete = index;
    }
  }

  LoadSelectAuto(index: number) {
    var arrayControl = this.inputFormGroup.get('input') as FormArray;
    // @ts-ignore
    this.input_array_Lists_Option[index] = arrayControl.at(index).get('value').valueChanges
      .pipe(
        startWith<string | Input_array>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.input_array_Lists.slice())
      )

  }

  displayFn(name: Input_array): string {
    return name && name.name ? name.name : '';
  }

  private _filter(name: string): Input_array[] {
    const filterValue = name.toLowerCase();
    return this.input_array_Lists.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  // Get Root category data.
  async getCategoryData(root_cat_id: string) {
    await this.dataSrv.getCategoryData(root_cat_id).toPromise()
      .then(data => {
        this.catLists = data;
        console.log('Get category data with Root Category ID');
      })
      .catch(err => {
        console.log('Not get category data with Root Category ID error : ' + err);
      });
  }

  async getInputFuncData() {
    await this.dataSrv.getInputFuncData().toPromise()
      .then(data => {
        this.inputLists_temp = data;
        console.log('Get Input Func data with Category ID');
      })
      .catch(err => {
        console.log('Not get Input Func data with Category ID error : ' + err);
      });
  }

  // Call all Array entry
  async getArrayFuncData() {
    await this.dataSrv.getArrayFuncData().toPromise()
      .then(data => {
        this.input_array_Lists_temp = data;
        console.log('Get Input Func data with Category ID');
      })
      .catch(err => {
        console.log('Not get Input Func data with Category ID error : ' + err);
      });
  }

  selectCat(cat_id: string, cardId: number) {
    this.catSelected = cat_id;
    this.catIsSelect = false;
    this.cardId = cardId;
    console.log(this.catLists)
  }

  selectRootCat(root_cat_id: string, rootCatCardId: number) {
    this.rootCatSelected = root_cat_id;
    this.rootCatIsSelect = false;
    this.rootCatCardId = rootCatCardId;
    console.log(this.rootCatLists)
  }

  // @ts-ignore
  focusRootCatCardStyle(rootCatCardId: number){
    const style = "outline: 3px solid #3f51b5;";
    if(rootCatCardId == this.rootCatCardId){
      return style;
    }
  }

  // @ts-ignore
  focusCatCardStyle(cardId: number){
    const style = "outline: 3px solid #3f51b5;";
    if(cardId == this.cardId){
      return style;
    }
  }

  // Confirm sub-cat for display input in next step
  async validCatSelect(cat_id: string){
    if (cat_id == null) {
      console.log('vide');
      return;
    }

    this.categoryId = cat_id;
    await this.selectInput()
    console.log(this.inputLists);

    this.selectInputOption()
    console.log(this.input_array_Lists);
    console.log(this.input_array_Lists_temp);

    // @ts-ignore
    this.stepper.selected.completed = true;
    this.stepper.next();
    console.log(cat_id);
  }

  // Confirm a root cat for display sub-cat in next step
  async validRootCatSelect(root_cat_id: string){
    if (root_cat_id == null) {
      console.log('vide');
      return;
    }
    await this.getCategoryData(root_cat_id)
    // @ts-ignore
    this.stepper.selected.completed = true;
    await this.stepper.next();
    console.log(root_cat_id);
    this.rootCategoryId = root_cat_id;
  }

  // Create estimate.
  async createEstim(cat_id: string | undefined, name: string, surname: string, mail: string, phone?: string) {
    await this.dataSrv.postEstimateData(cat_id, name, surname, mail)
      .toPromise()
      .then(data => {
        JSON.stringify(data);
        this.estim_Lists = data;
        this.estimId = this.estim_Lists._id;
      })
      .catch(err => {
        console.log('Not create estimate error : ' + err);
      });

  }

  async editEstim(calcul: string) {
    let estimId = await this.estimId
    await this.dataSrv.putEstimateData(calcul, estimId)
      .toPromise()
      .then(data => {
        this.estim_Lists = data;
        console.log(data)
      })
      .catch(err => {
        console.log('Not edit estimate error : ' + err);
      });
  }

  // Send all data of product, entry by user, in DB. estimId is used for bind user entry and user estimate.
  async sendInputValue(id: string, value: string) {
    let estimId = await this.estimId
    await console.log('Dans send input', estimId)
    await this.dataSrv.postInputValueData(estimId, id, value)
      .toPromise()
      .then(data => {
        JSON.stringify(data);
        this.input_Value_Lists = data;
        console.log(data);
      })
      .catch(err => {
        console.log('Not send input value error : ' + err);
      });
  }

  calculEstim(){
    let estimId = this.estimId
    this.dataSrv.postCalculateData(estimId).subscribe(data => {
      JSON.stringify(data);
      this.calcul_Estim_Lists = data;
      console.log(data)
      let price_up_temp: number;
      let price_down_temp: number;
      const price = this.calcul_Estim_Lists.propose_price ;
      const marge = this.calcul_Estim_Lists.marge;
      const percentage_price = Math.floor( (marge / 100) * price);
      price_up_temp = Math.floor(price + percentage_price);
      price_down_temp = Math.floor(price - percentage_price);
      this.price_down = price_down_temp;
      if (price_down_temp < 1){
        this.price_down = 1;
      }
      this.price_up = price_up_temp;
      if (price_up_temp < 1){
        this.price_down = 0;
        this.price_up = 0;
      }
      this.editEstim(this.calcul_Estim_Lists._id)
    });
  }

  // Sort input entry by user. Select entry is an Array
  submitInt() {
    console.log(this.inputFormGroup.value.input)
    for (let value of this.inputFormGroup.value.input) {
      // Select is Array
      if (value.value.value !== undefined){
        this.inputValueLists.push({id: value.id, value: value.value.value})
      }
      // The rest of classic input
      else{
        this.inputValueLists.push({id: value.id, value: value.value})
      }
    }
  }

  // Add personnal data user in price estimate. And calcul estmate.
  async submitDon() {
    if (!this.donneeFormGroup.valid) {
      return;
    }

    await this.createEstim(this.categoryId, this.donneeFormGroup.value.name, this.donneeFormGroup.value.surname, this.donneeFormGroup.value.mail, this.donneeFormGroup.value.phone);

    for (let data of this.inputValueLists){
      await this.sendInputValue(data.id, data.value);
    }

    await this.calculEstim();
  }

  // Sort input for sub-cat selected
  selectInput() {
    // @ts-ignore
    for (let input of this.inputLists_temp) {
      if (this.categoryId == input.category) {
        console.log(input);
        this.inputLists.push(input);
        if (input.text){
          this.addInputText(input._id)
        }
        else{
          this.addInput(input._id);
        }
      }

    }
  }

  // Sort input option for sub-cat selected
  selectInputOption() {
    for (let input of this.inputLists) {
      if (input.array) {
        // @ts-ignore
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
      value: ['', [Validators.required, autocompleteValidator()]]
    });
    this.input.push(inputForm);
  }

  addInputText(_id: string) {
    const inputForm = this._formBuilder.group({
      id: _id,
      value: ['', Validators.required]
    });
    this.input.push(inputForm);
  }

  // Reload app for new estimate
  refresh(): void { window.location.reload(); }

  // Load client page
  goWebsite(): void { window.location.href = "https://prozic.com"; }



}
