import {
  DoCheck,
  KeyValueDiffer,
  KeyValueDiffers,
  ElementRef,
  Directive,
  Renderer
} from 'angular2/core';
import {isPresent, isBlank, print} from 'angular2/src/facade/lang';
import {KeyValueChangeRecord} from "angular2/src/core/change_detection/differs/default_keyvalue_differ";

@Directive({ selector: '[omAttributes]', inputs: ['rawAttributes: omAttributes']})
export class OMAttributes implements DoCheck {
  /** @internal */
    _rawAttributes: {[key: string]: string};
  /** @internal */
  _differ: KeyValueDiffer;

  constructor(private _differs: KeyValueDiffers, private _ngEl: ElementRef,
              private _renderer: Renderer) {}

  set rawAttributes(v: {[key: string]: string}) {
      this._rawAttributes = v;
    if (isBlank(this._differ) && isPresent(v)) {
        this._differ = this._differs.find(this._rawAttributes).create(null);
    }
  }

  ngDoCheck() {
    if (isPresent(this._differ)) {
        var changes = this._differ.diff(this._rawAttributes);
      if (isPresent(changes)) {
        this._applyChanges(changes);
      }
    }
  }

  private _applyChanges(changes: any): void {
    changes.forEachAddedItem(
        (record: KeyValueChangeRecord) => { this._setStyle(record.key, record.currentValue); });
    changes.forEachChangedItem(
        (record: KeyValueChangeRecord) => { this._setStyle(record.key, record.currentValue); });
    changes.forEachRemovedItem(
        (record: KeyValueChangeRecord) => { this._setStyle(record.key, null); });
  }

  private _setStyle(name: string, val: string): void {
      this._renderer.setElementAttribute(this._ngEl.nativeElement, name, val);
  }
}