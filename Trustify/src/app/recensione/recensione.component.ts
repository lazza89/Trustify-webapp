import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Web3Service } from '../web3.service';

@Component({
  selector: 'app-recensione',
  templateUrl: './recensione.component.html',
  styleUrls: ['./recensione.component.css'],
})
export class RecensioneComponent implements OnInit {
  arrayDescriptions: string[] = [];
  arrayRatings: number[] = [];
  arrayAddresses: string[] = [];
  len: number[] = [];
  // starArr: number[] = [0,1,2,3,4];
  modified: boolean = false;
  rating: number = 0;
  starCount: number = 5;

  constructor(private web3: Web3Service) {}

  ngOnInit(): void {
    const reviews = this.web3.GetNMyReview(0, 10);
    reviews
      .then((val) => {
        this.arrayDescriptions = val[0];
        // console.log('arrayDescriptions'+this.arrayDescriptions);
        this.arrayRatings = val[1];
        this.arrayAddresses = val[2];
        console.log('dim' + val[2].length);
        for (let i = 0; i < val[2].length; i++) {
          this.len.push(i);
        }
      })
      .catch((val) => {
        'problem';
      });
  }

  showStarsReview(index: number, status: number) {
    // console.log('i'+index+'s'+status);
    if (index < this.arrayRatings[status]) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  async editReview(index: number) {
    let btn = document.getElementById('modifica'+index);
    let recensione = document.getElementById('descrizione'+index);

    if(!this.modified && btn?.innerText == 'Modifica') {
      if(recensione) recensione.setAttribute('contenteditable', 'true');
      if(btn) btn.innerHTML = 'Fatto';
      this.rating = 0;
      this.modified = true;
    } else if (this.modified && btn?.innerText == 'Fatto') {
      //chiamata a writeAReview()
      if(recensione) recensione.setAttribute('contenteditable', 'false');
      if(btn) btn.innerHTML = 'Modifica';
      let recensioneText = recensione?.innerText;
      console.log(recensione?.innerText);
      let indirizzo = document.getElementById('indirizzo'+index)?.innerText;
      console.log(indirizzo);
      this.modified = false;
      console.log('prova'+this.arrayRatings[index]);
      if(this.rating==0) this.rating = this.arrayRatings[index];
      if(indirizzo)
      this.web3.WriteAReview(indirizzo,String(recensioneText),this.rating);
    } else {
      alert('Finisci la modifica');
    }
  }

  async removeReview(index: number) {

  }

  async deleteReview(address: string) {
    await this.web3.DeleteReview(address);
  }

  onRatingChanged(rating: number) {
    if(this.modified) {
      // console.log(rating);
      // this.arrayRatings[value] = rating;
      // console.log('prova1'+this.arrayRatings[value]);
        this.rating = rating;
        console.log('prova1'+this.rating);
    }
  }

}
