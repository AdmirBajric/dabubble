import { Directive, HostListener, Input, ElementRef, Renderer2 } from '@angular/core';


interface ElementConfig {
  imageSelector?: string;  // CSS-Selektor für das Bild, das beim Hover seine Quelle ändern soll
  defaultSrc?: string;     // Standardbildquelle, die angezeigt wird, wenn nicht gehovert wird
  hoverSrc?: string;       // Bildquelle, die beim Hover angezeigt wird

  textSelector?: string;   // CSS-Selektor für das Textelement, das beim Hover seine Farbe ändern soll
  defaultColor?: string;   // Standardtextfarbe, die angezeigt wird, wenn nicht gehovert wird
  hoverColor?: string;     // Textfarbe, die beim Hover angezeigt wird
}

@Directive({
  selector: '[appHoverChange]',
  standalone: true
})
export class HoverChangeDirective {
  @Input() elementsConfig: ElementConfig[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.changeElements('hover');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.changeElements('default');
  }

  private changeElements(state: 'hover' | 'default') {
    this.elementsConfig.forEach((config: ElementConfig) => {
      if (config.imageSelector) {
        const imgElement = this.el.nativeElement.querySelector(config.imageSelector);
        const src = state === 'hover' && config.hoverSrc ? config.hoverSrc : config.defaultSrc;
        if (imgElement && src) {
          this.renderer.setAttribute(imgElement, 'src', src);
        }
      }

      if (config.textSelector) {
        const textElement = this.el.nativeElement.querySelector(config.textSelector);
        const color = state === 'hover' && config.hoverColor ? config.hoverColor : config.defaultColor;
        if (textElement && color) {
          this.renderer.setStyle(textElement, 'color', color);
        }
      }
    });
  }
}
