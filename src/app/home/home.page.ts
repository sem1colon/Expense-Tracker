import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  expenseList: Expense[] = [];
  totalExpenses: number = 0;

  constructor(
    public toastController: ToastController,
    public alertController: AlertController
  ) { }
  ngOnInit(): void {
    this.getData();
  }

  addToExpenses(expenseName: string, expenseAmount: number) {
    if (expenseName.trim().length <= 0 || expenseAmount <= 0) {
      return;
    }
    const expense = new Expense(expenseName, expenseAmount);
    this.expenseList.push(expense);
    this.totalExpenses += + expenseAmount;
    this.saveData(this.expenseList, this.totalExpenses);
  }

  async removeFromExpenses(expense: Expense) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'Do you want to remove ' + expense.name + ' from your expenses?',
      buttons: [
        {
          text: 'Okay',
          handler: async () => {
            this.expenseList = this.expenseList.filter(
              expenseObject => {
                return expenseObject.name !== expense.name
              }
            );
            this.totalExpenses -= expense.amount;
            const toast = await this.toastController.create({
              message: expense.name + ' has been removed from your expenses.',
              duration: 2000,
              cssClass: 'ion-text-center'
            });
            toast.present();
            this.saveData(this.expenseList, this.totalExpenses);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }
  async saveData(expenseList: Expense[], totalExpenses: number) {
    Storage.set(
      {
        key: 'expenseList',
        value: JSON.stringify(expenseList)
      }
    );
    Storage.set(
      {
        key: 'totalExpenses',
        value: JSON.stringify(totalExpenses)
      }
    );
  }
  async getData() {
    const expenseList = await Storage.get({ key: 'expenseList' });
    this.expenseList = JSON.parse(expenseList.value);
    const totalExpenses = await Storage.get({ key: 'totalExpenses' });
    this.totalExpenses = totalExpenses != null ? JSON.parse(JSON.parse(totalExpenses.value)) : [];
  }
}



export class Expense {
  name: string;
  amount: number;

  constructor(name: string, amount: number) {
    this.name = name;
    this.amount = amount;
  }
}
