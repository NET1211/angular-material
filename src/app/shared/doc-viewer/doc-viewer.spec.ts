import {HttpTestingController} from '@angular/common/http/testing';
import {Component} from '@angular/core';
import {async, inject, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {DocViewer} from './doc-viewer';
import {DocViewerModule} from './doc-viewer-module';


describe('DocViewer', () => {
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DocViewerModule, DocsAppTestingModule],
      declarations: [DocViewerTestComponent],
    }).compileComponents();
  }));

  beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
    http = h;
  }));

  it('should load doc into innerHTML', () => {
    let fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    let docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toBe('<div>my docs page</div>');
  });

  it('should save textContent of the doc', () => {
    let fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    let docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer.componentInstance.textContent).toBe('my docs page');
  });


  it('should correct hash based links', () => {
    let fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.componentRef.instance.documentUrl = `http://material.angular.io/doc-with-links.html`;
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    let docViewer = fixture.debugElement.query(By.directive(DocViewer));
    // Our test runner runs at the page /context.html, so it will be the prepended value.
    expect(docViewer.nativeElement.innerHTML).toContain(`/context.html#test"`);
  });

  it('should show error message when doc not found', () => {
    spyOn(console, 'log');

    const fixture = TestBed.createComponent(DocViewerTestComponent);
    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const errorUrl = 'http://material.angular.io/error-doc.html';

    fixture.componentInstance.documentUrl = errorUrl;
    fixture.detectChanges();

    http.expectOne(errorUrl).flush('Not found', {status: 404, statusText: 'Not found'});


    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toContain(
        'Failed to load document: http://material.angular.io/error-doc.html');
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  // TODO(mmalerba): Add test that example-viewer is instantiated.
});

@Component({
  selector: 'test',
  template: `<doc-viewer [documentUrl]="documentUrl"></doc-viewer>`,
})
class DocViewerTestComponent {
  documentUrl = 'http://material.angular.io/simple-doc.html';
}

const FAKE_DOCS = {
  'http://material.angular.io/simple-doc.html': '<div>my docs page</div>',
  'http://material.angular.io/doc-with-example.html': `
      <div>Check out this example:</div>
      <div material-docs-example="some-example"></div>`,
  'http://material.angular.io/doc-with-links.html': `<a href="#test">Test link</a>`,
};
