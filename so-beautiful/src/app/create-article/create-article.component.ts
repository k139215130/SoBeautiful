import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../services/article/article.service';
import { ArticleCreate } from '../models/article/article-create.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormError } from '../models/form-error';
import { NotificationService } from '../services/notification/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-article',
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.scss']
})
export class CreateArticleComponent implements OnInit {

  createForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private notificationService: NotificationService,
    private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.createForm = this.fb.group({
      Title: [null, [Validators.required, Validators.maxLength(50)]],
      Content: [null, [Validators.required]]
    });
  }

  onSubmit(value: ArticleCreate): void {
    this.articleService.create(value).subscribe(
      () => { this.createSuccess(); },
      (err: HttpErrorResponse) => { this.createFail(err); }
    );
  }

  createSuccess(): void {
    this.notificationService.successMessage('建立成功');
    this.router.navigate(['/']);
  }

  createFail(err: HttpErrorResponse): void {
    if (err.status === 400) {
      const errors: FormError[] = err.error;
      try {
        errors.every(element => {
          if (!element.propertyName) {
            return false;
          } else {
            const controlName = element.propertyName;
            // 雖然可能有多個錯誤，但後面的會蓋掉前面的
            if (this.createForm.get(controlName) !== null) {
              this.createForm.controls[controlName].setErrors({server: element.errorMessage});
            }
            return true;
          }
        });
        this.notificationService.errorMessage('建立失敗');
      } catch (error) {
        this.notificationService.errorMessage('發生未知錯誤');
      }
    }
  }

}
