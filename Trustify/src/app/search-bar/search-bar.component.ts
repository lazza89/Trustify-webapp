import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RecensioniParserService } from '../recensioni-parser.service';
import { Recensione } from '../recensione';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  form: FormGroup = new FormGroup({});
  reviews: Recensione[] = [];

  private readonly ADDRESS_VALIDATOR_PATTERN = '^0x[a-fA-F0-9]{40}$';

  private readonly DEFAULT_ADDRESS =
    '0xC4D68860Af6a1190B69d80567E8Cd688E1bAE5ce';
  private address: string = this.DEFAULT_ADDRESS;
  private readonly REVIEW_INDEX_ADDER = 10;
  private reviewsStartFrom = 0;
  private reviewsEndTo = 9;

  constructor(
    private formBuilder: FormBuilder,
    private reviewParserService: RecensioniParserService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.form = this.formBuilder.group({
      address: [
        null,
        [
          Validators.required,
          Validators.pattern(this.ADDRESS_VALIDATOR_PATTERN),
        ],
      ],
    });

    await this.getCompanyReview(this.DEFAULT_ADDRESS);
  }

  async loadMoreReview() {
    this.reviewsStartFrom = this.reviewsEndTo + 1;
    this.reviewsEndTo += this.REVIEW_INDEX_ADDER;

    await this.getCompanyReview(this.DEFAULT_ADDRESS);
  }

  onSubmit(form: any) {
    this.address = form.value.address;
    this.getCompanyReview(form.value.address);
  }

  async getCompanyReview(address: string) {
    try {
      let tmpReviews = await this.reviewParserService.retriveHomePageReviews(
        this.reviewsStartFrom,
        this.reviewsEndTo,
        address
      );
      for (let rev of tmpReviews) {
        this.reviews.push(rev);
      }
    } catch (error: any) {
      if (
        error.message.includes(
          'revert Start must be less than the length of the array'
        )
      ) {
        this.snackBar.open('Non ci sono più recensioni da caricare', 'Chiudi', {
          duration: 5000,
        });
      } else {
        this.snackBar.open('Questo indirizzo non ha recensioni', 'Chiudi', {
          duration: 5000,
        });
        this.reviews = [];
      }
    }
  }
}
