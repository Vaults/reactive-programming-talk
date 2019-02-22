import {Component, OnInit} from '@angular/core';
import {merge, Subject} from 'rxjs';
import {bufferTime, delay, filter, map, mergeMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {WiseQuoteModel} from './WiseQuote.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Any is evil, don't try this at home kids!
  public data: any = 'hello world';
  // Angular placeholder
  public text = '';

  public buttonOne: Subject<string> = new Subject();
  public buttonTwo: Subject<string> = new Subject();
  public buttonThree: Subject<string> = new Subject();

  public inputText: Subject<string> = new Subject();

  private wiseQuote: Subject<string> = new Subject();

  constructor(public httpClient: HttpClient) { }

  ngOnInit(): void {
    const quoteObservable = this.getQuoteObservable();
    const buttonClickObservable = this.getButtonClickObservable();

    merge(buttonClickObservable, this.inputText, quoteObservable)
      .subscribe(data => this.data = data);
  }

  private getButtonClickObservable() {
    const transformationMap = {
      One : 1,
      Two : 2,
      Three : 3,
    };

    const toNumber: (s: string) => number = (s: string) => transformationMap[s];

    return merge(this.buttonOne, this.buttonTwo, this.buttonThree)
      .pipe(
        map(toNumber),
        bufferTime(1000),
        filter(arr => arr.length > 2),
        map(arr => arr.reduce((p, n) => p + n, 0)),
        delay(2000)
      );
  }

  private getQuoteObservable() {
    return this.wiseQuote.pipe(
      mergeMap(_ =>
        this.httpClient.get<WiseQuoteModel>('https://favqs.com/api/qotd')
      ),
      map(model => {
        const firstQuote = model.quote;
        return `"${firstQuote.body}" - ${firstQuote.author}. (obligatory copyright: ${firstQuote.url})`;
      })
    );
  }

  public getWisdom() {
    this.wiseQuote.next();
  }
}
