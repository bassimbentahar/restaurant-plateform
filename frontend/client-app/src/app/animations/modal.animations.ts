import { createAnimation } from '@ionic/angular';

export const modalEnterAnimation = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot;

  const backdrop = root?.querySelector('ion-backdrop');
  const wrapper = root?.querySelector('.modal-wrapper');

  if (!backdrop || !wrapper) {
    return createAnimation()
      .addElement(baseEl)
      .duration(0);
  }

  const backdropAnimation = createAnimation()
    .addElement(backdrop)
    .fromTo('opacity', '0.01', '0.4');

  const wrapperAnimation = createAnimation()
    .addElement(wrapper)
    .beforeStyles({
      transform: 'translateY(24px) scale(0.98)',
      opacity: '0',
    })
    .fromTo('transform', 'translateY(24px) scale(0.98)', 'translateY(0) scale(1)')
    .fromTo('opacity', '0', '1');

  return createAnimation()
    .addElement(baseEl)
    .easing('cubic-bezier(0.22, 1, 0.36, 1)')
    .duration(260)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};

export const modalLeaveAnimation = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot;

  const backdrop = root?.querySelector('ion-backdrop');
  const wrapper = root?.querySelector('.modal-wrapper');

  if (!backdrop || !wrapper) {
    return createAnimation()
      .addElement(baseEl)
      .duration(0);
  }

  const backdropAnimation = createAnimation()
    .addElement(backdrop)
    .fromTo('opacity', '0.4', '0');

  const wrapperAnimation = createAnimation()
    .addElement(wrapper)
    .fromTo('transform', 'translateY(0) scale(1)', 'translateY(20px) scale(0.98)')
    .fromTo('opacity', '1', '0');

  return createAnimation()
    .addElement(baseEl)
    .easing('cubic-bezier(0.4, 0, 1, 1)')
    .duration(180)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
