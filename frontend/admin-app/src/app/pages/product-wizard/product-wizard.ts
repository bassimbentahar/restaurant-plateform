import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonToggle,
    ModalController,
} from '@ionic/angular/standalone';
import {ToastController} from '@ionic/angular';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {addIcons} from 'ionicons';
import {
    addCircleOutline,
    checkmarkCircleOutline,
    eyeOutline,
    libraryOutline,
    trashOutline,
    warningOutline,
} from 'ionicons/icons';
import {firstValueFrom} from 'rxjs';

import {ProductEditorStore} from './state/product-editor.store';
import {
    OptionGroupLibraryItem,
    ProductChoiceDraft,
    ProductRuleDraft,
    ProductRuleActionDraft,
    ProductRuleConditionDraft,
    ProductRuleDay,
    ProductRuleOrderType,
    ProductRuleTargetType,
    ProductRuleType,
    ProductWizardStepId,
} from './state/product-editor.model';
import {ProductWizardFacade} from './data-access/product-wizard.facade';
import {ProductAdminApiService} from './data-access/product-admin-api.service';
import {OptionLibraryPickerModal} from './components/option-library-picker.modal';
import {
    ProductChoiceConfigurationModal
} from './components/product-choice-configuration/product-choice-configuration.modal';
import {
    ProductCategoryPickerModal,
    ProductCategoryPickerResult,
} from './components/product-category-picker/product-category-picker.modal';
import {RuleLibraryPickerModal} from '../rule/rule-picker/rule-library-picker.modal';
import {RestaurantRuleResponse} from '../rule/dto/rule-admin.dto';
import {RuleAdminApiService} from '../../services/rule-admin-api.service';
import {RulesStepComponent} from './components/rules-step/rules-step.component';
import {ChoicesStepComponent} from './components/choices-step/choices-step.component';
import {FormatsStepComponent} from './components/formats-step/formats-step.component';

const REQUIRED_MIN_VALIDATION_KEY =
    'adminProductWizard.choiceConfiguration.validation.requiredMin';

const REQUIRED_MAX_VALIDATION_KEY =
    'adminProductWizard.choiceConfiguration.validation.requiredMax';

const MAX_OPTIONS_VALIDATION_KEY =
    'adminProductWizard.choiceConfiguration.validation.maxGreaterThanAvailableOptions';

type ChoiceFieldMessages = {
    min?: string | null;
    max?: string | null;
};

type ChoiceConfigurationResult = {
    required: boolean;
    minSelections: number;
    maxSelections: number;
    displayOrder: number;
};

type SelectOption<T extends string> = {
    value: T;
    labelKey: string;
};

type BusinessRuleTemplate = {
    type: ProductRuleType;
    titleKey: string;
    helpKey: string;
    exampleKey: string;
};

const BUSINESS_RULE_TEMPLATES: BusinessRuleTemplate[] = [
    {
        type: 'AVAILABILITY',
        titleKey: 'adminProductWizard.conditions.businessTemplates.availability.title',
        helpKey: 'adminProductWizard.conditions.businessTemplates.availability.help',
        exampleKey: 'adminProductWizard.conditions.businessTemplates.availability.example',
    },
    {
        type: 'VISIBILITY',
        titleKey: 'adminProductWizard.conditions.businessTemplates.visibility.title',
        helpKey: 'adminProductWizard.conditions.businessTemplates.visibility.help',
        exampleKey: 'adminProductWizard.conditions.businessTemplates.visibility.example',
    },
    {
        type: 'INCLUDED_OPTION',
        titleKey: 'adminProductWizard.conditions.businessTemplates.included.title',
        helpKey: 'adminProductWizard.conditions.businessTemplates.included.help',
        exampleKey: 'adminProductWizard.conditions.businessTemplates.included.example',
    },
    {
        type: 'PRICE_RULE',
        titleKey: 'adminProductWizard.conditions.businessTemplates.price.title',
        helpKey: 'adminProductWizard.conditions.businessTemplates.price.help',
        exampleKey: 'adminProductWizard.conditions.businessTemplates.price.example',
    },
    {
        type: 'SELECTION_RULE',
        titleKey: 'adminProductWizard.conditions.businessTemplates.selection.title',
        helpKey: 'adminProductWizard.conditions.businessTemplates.selection.help',
        exampleKey: 'adminProductWizard.conditions.businessTemplates.selection.example',
    },
];

const CONDITION_DAY_OPTIONS: SelectOption<ProductRuleDay>[] = [
    {value: 'MONDAY', labelKey: 'adminProductWizard.conditions.days.MONDAY'},
    {value: 'TUESDAY', labelKey: 'adminProductWizard.conditions.days.TUESDAY'},
    {value: 'WEDNESDAY', labelKey: 'adminProductWizard.conditions.days.WEDNESDAY'},
    {value: 'THURSDAY', labelKey: 'adminProductWizard.conditions.days.THURSDAY'},
    {value: 'FRIDAY', labelKey: 'adminProductWizard.conditions.days.FRIDAY'},
    {value: 'SATURDAY', labelKey: 'adminProductWizard.conditions.days.SATURDAY'},
    {value: 'SUNDAY', labelKey: 'adminProductWizard.conditions.days.SUNDAY'},
];

const ORDER_TYPE_OPTIONS: SelectOption<ProductRuleOrderType>[] = [
    {value: 'DELIVERY', labelKey: 'adminProductWizard.conditions.orderTypes.delivery'},
    {value: 'PICKUP', labelKey: 'adminProductWizard.conditions.orderTypes.pickup'},
];

@Component({
    selector: 'app-product-wizard',
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardContent,
        IonButton,
        IonIcon,
        IonInput,
        IonTextarea,
        IonItem,
        IonLabel,
        IonList,
        IonNote,
        IonText,
        IonBadge,
        IonToggle,
        IonCheckbox,
        IonSegment,
        IonSegmentButton,
        IonSelect,
        IonSelectOption,
        TranslatePipe,
        RulesStepComponent,
        ChoicesStepComponent,
        FormatsStepComponent,
    ],
    providers: [ProductEditorStore, ProductWizardFacade],
    templateUrl: './product-wizard.html',
    styleUrls: ['./product-wizard.scss'],
})
export class ProductWizard implements OnInit {
    readonly store = inject(ProductEditorStore);
    readonly facade = inject(ProductWizardFacade);

    private readonly modalController = inject(ModalController);
    private readonly toastController = inject(ToastController);
    private readonly translate = inject(TranslateService);
    private readonly route = inject(ActivatedRoute);
    private readonly productAdminApi = inject(ProductAdminApiService);
    private readonly ruleAdminApi = inject(RuleAdminApiService);

    readonly draft = this.store.draft;
    readonly currentStep = this.store.currentStep;
    readonly selectedVariant = this.store.selectedVariant;
    readonly previewPrice = this.store.previewPrice;
    readonly validationErrors = this.store.validationErrors;
    readonly canPublish = this.store.canPublish;

    readonly editingProductId = signal<string | null>(null);
    readonly editLoading = signal(false);
    readonly editLoadErrorKey = signal<string | null>(null);

    readonly pageTitleKey = computed(() =>
        this.editingProductId()
            ? 'adminProductWizard.edit.title'
            : 'adminProductWizard.title'
    );

    readonly pageSubtitleKey = computed(() =>
        this.editingProductId()
            ? 'adminProductWizard.edit.subtitle'
            : 'adminProductWizard.subtitle'
    );

    readonly publishActionKey = computed(() =>
        this.editingProductId()
            ? 'adminProductWizard.actions.updateProduct'
            : 'adminProductWizard.actions.publish'
    );

    readonly reusableRules = signal<RestaurantRuleResponse[]>([]);

    readonly businessRuleTemplates = BUSINESS_RULE_TEMPLATES;
    readonly conditionDayOptions = CONDITION_DAY_OPTIONS;
    readonly orderTypeOptions = ORDER_TYPE_OPTIONS;

    private readonly advancedRuleTypeSignal = signal<ProductRuleType>('AVAILABILITY');
    readonly advancedRuleType = this.advancedRuleTypeSignal.asReadonly();

    readonly selectedChoice = computed(() => this.draft().choices[0] ?? null);

    readonly selectedFormatChoices = computed(() => {
        const variant = this.selectedVariant();
        return variant ? this.store.getChoicesForVariant(variant.id) : [];
    });

    private readonly choiceFieldMessagesSignal =
        signal<Record<string, ChoiceFieldMessages>>({});

    constructor() {
        addIcons({
            addCircleOutline,
            checkmarkCircleOutline,
            eyeOutline,
            libraryOutline,
            trashOutline,
            warningOutline,
        });
    }

    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.facade.loadOptionGroups(),
            this.facade.loadCategories(),
            this.loadReusableRules(),
        ]);

        const productId = this.route.snapshot.paramMap.get('id');

        if (productId) {
            this.editingProductId.set(productId);
            await this.loadProductForEdit(productId);
        }
    }

    async loadProductForEdit(productId: string): Promise<void> {
        this.editLoading.set(true);
        this.editLoadErrorKey.set(null);

        try {
            const product = await firstValueFrom(
                this.productAdminApi.getProduct(productId)
            );
            console.log(product)

            this.store.loadProductForEdit(product);

        } catch (error) {
            console.error('Impossible de charger le produit à modifier', error);
            this.editLoadErrorKey.set('adminProductWizard.errors.loadProductFailed');

            const toast = await this.toastController.create({
                message: this.translate.instant(
                    'adminProductWizard.errors.loadProductFailed'
                ),
                duration: 2800,
                color: 'danger',
                position: 'bottom',
            });

            await toast.present();
        } finally {
            this.editLoading.set(false);
        }
    }

    async loadReusableRules(): Promise<void> {
        try {
            const rules: RestaurantRuleResponse[] = await firstValueFrom(
                this.ruleAdminApi.getRuleLibrary()
            );

            this.reusableRules.set(rules);
        } catch (error) {
            console.error(
                'Impossible de charger la bibliothèque de règles',
                error
            );
        }
    }

    setStep(step: ProductWizardStepId): void {
        this.store.setStep(step);
    }

    next(): void {
        this.store.nextStep();
    }

    previous(): void {
        this.store.previousStep();
    }

    updateTitle(value: string | number | null | undefined): void {
        this.store.updateGeneralInfo({title: String(value ?? '')});
    }

    updateShortDescription(value: string | number | null | undefined): void {
        this.store.updateGeneralInfo({shortDescription: String(value ?? '')});
    }

    updateDescription(value: string | number | null | undefined): void {
        this.store.updateGeneralInfo({description: String(value ?? '')});
    }

    updateBasePrice(value: string | number | null | undefined): void {
        this.store.updatePricing(Number(value ?? 0), this.draft().compareAtPrice);
    }

    updateCompareAtPrice(value: string | number | null | undefined): void {
        const compareAtPrice =
            value === null || value === undefined || value === ''
                ? undefined
                : Number(value);

        this.store.updatePricing(this.draft().basePrice, compareAtPrice);
    }

    async saveDraft(): Promise<void> {
        await this.facade.saveDraft();
    }

    async publishProduct(): Promise<void> {
        const productId = this.editingProductId();

        if (productId) {
            await this.facade.updateProduct(productId);
            return;
        }

        await this.facade.publish();
    }

    async openLibraryPicker(): Promise<void> {
        const pickerModal = await this.modalController.create({
            component: OptionLibraryPickerModal,
            componentProps: {
                choices: this.store.availableLibraryChoices(),
            },
            cssClass: 'option-library-picker-modal',
        });

        await pickerModal.present();

        const pickerResult = await pickerModal.onDidDismiss<{ optionGroupId: string }>();

        if (pickerResult.role === 'create-custom') {
            this.store.addCustomChoice();
            return;
        }

        if (pickerResult.role !== 'selected' || !pickerResult.data?.optionGroupId) {
            return;
        }

        const selectedChoice = this.store
            .libraryChoices()
            .find((choice) => choice.id === pickerResult.data?.optionGroupId);

        if (!selectedChoice) {
            return;
        }

        await this.openChoiceConfiguration(selectedChoice);
    }

    async openLibraryPickerForSelectedFormat(): Promise<void> {
        const variant = this.selectedVariant();
        if (!variant) {
            return;
        }

        const pickerModal = await this.modalController.create({
            component: OptionLibraryPickerModal,
            componentProps: {
                choices: this.store.availableLibraryChoicesForVariant(variant.id),
            },
            cssClass: 'option-library-picker-modal',
        });

        await pickerModal.present();

        const pickerResult = await pickerModal.onDidDismiss<{ optionGroupId: string }>();

        if (pickerResult.role !== 'selected' || !pickerResult.data?.optionGroupId) {
            return;
        }

        const selectedChoice = this.store
            .libraryChoices()
            .find((choice) => choice.id === pickerResult.data?.optionGroupId);

        if (!selectedChoice) {
            return;
        }

        const configuration = await this.openVariantChoiceConfiguration(
            selectedChoice,
            this.store.getVariantChoiceCount(variant.id)
        );

        if (!configuration) {
            return;
        }

        this.store.addChoiceToVariantFromLibrary(variant.id, selectedChoice.id, {
            required: configuration.required,
            minSelections: configuration.minSelections,
            maxSelections: configuration.maxSelections,
            includedSelections: 0,
            displayOrder: configuration.displayOrder,
        });
    }

    configureVariantChoices(variantId: string): void {
        this.store.selectVariant(variantId);
        this.setStep('format-configuration');
    }

    adaptChoiceByFormat(choiceId: string): void {
        const variant =
            this.selectedVariant() ??
            this.draft().variants.find((item) => item.isDefault) ??
            this.draft().variants[0];

        if (!variant) {
            return;
        }

        this.store.selectVariant(variant.id);
        this.store.focusChoiceForFormat(choiceId);
        this.setStep('format-configuration');
    }

    updateFormatChoiceRequired(
        variantId: string,
        optionGroupId: string,
        required: boolean
    ): void {
        const choice = this.selectedFormatChoices().find(
            (item) => item.optionGroupId === optionGroupId
        );

        if (!choice) {
            return;
        }

        this.store.updateVariantChoiceRule(variantId, optionGroupId, {
            required,
            minSelections: required && choice.minSelections < 1 ? 1 : choice.minSelections,
            maxSelections: required && choice.maxSelections < 1 ? 1 : choice.maxSelections,
        });
    }

    updateFormatChoiceMinSelections(
        variantId: string,
        optionGroupId: string,
        value: string | number | null | undefined
    ): void {
        this.store.updateVariantChoiceRule(variantId, optionGroupId, {
            minSelections: this.toPositiveInteger(value, 0),
        });
    }

    updateFormatChoiceMaxSelections(
        variantId: string,
        optionGroupId: string,
        value: string | number | null | undefined
    ): void {
        this.store.updateVariantChoiceRule(variantId, optionGroupId, {
            maxSelections: this.toPositiveInteger(value, 0),
        });
    }

    updateFormatChoiceIncludedSelections(
        variantId: string,
        optionGroupId: string,
        value: string | number | null | undefined
    ): void {
        this.store.updateVariantChoiceRule(variantId, optionGroupId, {
            includedSelections: this.toPositiveInteger(value, 0),
        });
    }

    updateChoiceRequired(choiceId: string, required: boolean): void {
        const choice = this.findChoice(choiceId);
        if (!choice) return;

        const availableOptionCount = this.getAvailableOptionCount(choice);
        const patch: Partial<ProductChoiceDraft> = {required};

        if (required && choice.minSelections < 1) patch.minSelections = 1;
        if (required && choice.maxSelections < 1) patch.maxSelections = availableOptionCount > 0 ? 1 : 0;

        const nextMaxSelections = patch.maxSelections ?? choice.maxSelections;
        if (nextMaxSelections > availableOptionCount) patch.maxSelections = availableOptionCount;

        this.clearChoiceMessages(choiceId);
        this.store.updateChoice(choiceId, patch);
    }

    updateChoiceMinSelections(choiceId: string, value: string | number | null | undefined): void {
        const choice = this.findChoice(choiceId);
        if (!choice) return;

        const minSelections = this.toPositiveInteger(value, 0);

        if (choice.required && minSelections < 1) {
            this.store.updateChoice(choiceId, {minSelections: 1});
            this.setChoiceMessage(choiceId, 'min', REQUIRED_MIN_VALIDATION_KEY);
            return;
        }

        this.store.updateChoice(choiceId, {minSelections});
        this.setChoiceMessage(choiceId, 'min', null);
    }

    updateChoiceMaxSelections(choiceId: string, value: string | number | null | undefined): void {
        const choice = this.findChoice(choiceId);
        if (!choice) return;

        const maxSelections = this.toPositiveInteger(value, 0);
        const availableOptionCount = this.getAvailableOptionCount(choice);

        if (choice.required && maxSelections < 1) {
            this.store.updateChoice(choiceId, {maxSelections: availableOptionCount > 0 ? 1 : 0});
            this.setChoiceMessage(choiceId, 'max', REQUIRED_MAX_VALIDATION_KEY);
            return;
        }

        if (maxSelections > availableOptionCount) {
            this.store.updateChoice(choiceId, {maxSelections: availableOptionCount});
            this.setChoiceMessage(choiceId, 'max', MAX_OPTIONS_VALIDATION_KEY);
            return;
        }

        this.store.updateChoice(choiceId, {maxSelections});
        this.setChoiceMessage(choiceId, 'max', null);
    }

    choiceMinMessageKey(choiceId: string): string | null {
        return this.choiceFieldMessagesSignal()[choiceId]?.min ?? null;
    }

    choiceMaxMessageKey(choiceId: string): string | null {
        return this.choiceFieldMessagesSignal()[choiceId]?.max ?? null;
    }

    isChoiceMinGreaterThanMax(choice: ProductChoiceDraft): boolean {
        return choice.minSelections > choice.maxSelections;
    }

    blockInvalidNumberKeys(event: KeyboardEvent): void {
        const allowedControlKeys = [
            'Backspace',
            'Delete',
            'Tab',
            'Escape',
            'Enter',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
        ];

        if (allowedControlKeys.includes(event.key)) return;
        if (event.ctrlKey || event.metaKey) return;
        if (!/^\d$/.test(event.key)) event.preventDefault();
    }

    addRule(type: ProductRuleType): void {
        const label = this.translate.instant(
            `adminProductWizard.conditions.defaultRule.${type}.label`
        );

        const description = this.translate.instant(
            `adminProductWizard.conditions.defaultRule.${type}.description`
        );

        const tagsText = this.translate.instant(
            `adminProductWizard.conditions.defaultRule.${type}.tags`
        );

        this.store.addRule({
            type,
            label,
            description,
            tags: tagsText
                .split(',')
                .map((tag: string) => tag.trim())
                .filter(Boolean),
        });
    }

    createAdvancedCondition(): void {
        this.addRule('AVAILABILITY');
    }

    async openRuleLibraryPicker(): Promise<void> {
        if (this.reusableRules().length === 0) {
            await this.loadReusableRules();
        }

        const disabledRuleIds = this.reusableRules()
            .filter((rule) => this.store.isLibraryRuleAlreadyDefined(rule))
            .map((rule) => rule.id);

        const modal = await this.modalController.create({
            component: RuleLibraryPickerModal,
            componentProps: {
                rules: this.reusableRules(),
                disabledRuleIds,
            },
            cssClass: 'rule-library-picker-modal',
        });

        await modal.present();

        const result = await modal.onDidDismiss<RestaurantRuleResponse>();

        if (result.role !== 'select' || !result.data) {
            return;
        }

        const addResult = this.store.addRuleFromLibrary(result.data);

        if (!addResult.added) {
            await this.showRuleDuplicateToast(addResult.reason);
        }
    }

    private async showRuleDuplicateToast(
        reason: 'SOURCE_ALREADY_ADDED' | 'BUSINESS_RULE_ALREADY_EXISTS'
    ): Promise<void> {
        const messageKey =
            reason === 'SOURCE_ALREADY_ADDED'
                ? 'adminProductWizard.conditions.libraryPicker.alreadyAddedToast'
                : 'adminProductWizard.conditions.libraryPicker.businessDuplicateToast';

        const toast = await this.toastController.create({
            message: this.translate.instant(messageKey),
            duration: 2600,
            color: 'warning',
            position: 'bottom',
        });

        await toast.present();
    }

    updateAdvancedRuleType(value: ProductRuleType | string | null | undefined): void {
        const type = this.toProductRuleType(value);
        this.advancedRuleTypeSignal.set(type);
    }

    conditionKindLabelKey(type: ProductRuleType): string {
        switch (type) {
            case 'AVAILABILITY':
                return 'adminProductWizard.conditions.businessTemplates.availability.title';
            case 'VISIBILITY':
                return 'adminProductWizard.conditions.businessTemplates.visibility.title';
            case 'SELECTION_RULE':
                return 'adminProductWizard.conditions.businessTemplates.selection.title';
            case 'INCLUDED_OPTION':
                return 'adminProductWizard.conditions.businessTemplates.included.title';
            case 'PRICE_RULE':
                return 'adminProductWizard.conditions.businessTemplates.price.title';
        }
    }

    conditionKindHelpKey(type: ProductRuleType): string {
        switch (type) {
            case 'AVAILABILITY':
                return 'adminProductWizard.conditions.businessTemplates.availability.help';
            case 'VISIBILITY':
                return 'adminProductWizard.conditions.businessTemplates.visibility.help';
            case 'SELECTION_RULE':
                return 'adminProductWizard.conditions.businessTemplates.selection.help';
            case 'INCLUDED_OPTION':
                return 'adminProductWizard.conditions.businessTemplates.included.help';
            case 'PRICE_RULE':
                return 'adminProductWizard.conditions.businessTemplates.price.help';
        }
    }

    updateConditionContextVariant(
        conditionId: string,
        variantId: string | null | undefined
    ): void {
        this.patchCondition(conditionId, {
            variantId: variantId || undefined,
        });
    }

    updateConditionAvailabilityMode(
        conditionId: string,
        mode: 'AVAILABLE' | 'UNAVAILABLE'
    ): void {
        this.updateConditionAvailable(conditionId, mode === 'AVAILABLE');
    }

    updateConditionVisibilityMode(
        conditionId: string,
        mode: 'VISIBLE' | 'HIDDEN'
    ): void {
        this.updateConditionVisible(conditionId, mode === 'VISIBLE');
    }

    updateConditionRequiredMode(
        conditionId: string,
        mode: 'REQUIRED' | 'OPTIONAL'
    ): void {
        this.updateConditionRequired(conditionId, mode === 'REQUIRED');
    }

    conditionBusinessSummary(condition: ProductRuleDraft): string {
        const target = this.describeConditionTarget(condition);
        const timing = this.describeConditionTiming(condition);

        switch (condition.type) {
            case 'AVAILABILITY':
                return this.translate.instant(
                    condition.action.available === false
                        ? 'adminProductWizard.conditions.summary.availabilityUnavailable'
                        : 'adminProductWizard.conditions.summary.availabilityAvailable',
                    {target, timing}
                );

            case 'VISIBILITY':
                return this.translate.instant(
                    condition.action.visible === false
                        ? 'adminProductWizard.conditions.summary.visibilityHidden'
                        : 'adminProductWizard.conditions.summary.visibilityVisible',
                    {target, timing}
                );

            case 'SELECTION_RULE':
                return this.translate.instant(
                    condition.action.required === false
                        ? 'adminProductWizard.conditions.summary.selectionOptional'
                        : 'adminProductWizard.conditions.summary.selectionRequired',
                    {target, timing}
                );

            case 'INCLUDED_OPTION':
                return this.translate.instant(
                    'adminProductWizard.conditions.summary.includedOption',
                    {
                        count: condition.action.includedSelections ?? 1,
                        target,
                        timing,
                    }
                );

            case 'PRICE_RULE':
                return this.translate.instant(
                    'adminProductWizard.conditions.summary.priceAdjustment',
                    {
                        target,
                        amount: (condition.action.priceDeltaOverride ?? 0).toFixed(2),
                        timing,
                    }
                );
        }
    }

    removeCondition(conditionId: string): void {
        this.store.removeRule(conditionId);
    }

    updateConditionLabel(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.store.updateRule(conditionId, {
            label: String(value ?? ''),
        });
    }

    updateConditionEnabled(conditionId: string, enabled: boolean): void {
        this.store.updateRule(conditionId, {enabled});
    }

    updateConditionType(conditionId: string, type: ProductRuleType): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        this.store.updateRule(conditionId, {
            type,
            label: this.createDefaultConditionLabel(type),
            action: this.createDefaultConditionAction(type),
        });
    }

    updateConditionTargetType(
        conditionId: string,
        targetType: ProductRuleTargetType
    ): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        this.store.updateRule(conditionId, {
            targetType,
            targetId: undefined,
            condition: {
                ...condition.condition,
                variantId: undefined,
                optionGroupId: undefined,
                optionItemId: undefined,
            },
        });
    }

    updateConditionVariantTarget(
        conditionId: string,
        variantId: string | null | undefined
    ): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        const targetId = variantId || undefined;

        this.store.updateRule(conditionId, {
            targetId,
            condition: {
                ...condition.condition,
                variantId: targetId,
            },
        });
    }

    updateConditionOptionGroupTarget(
        conditionId: string,
        optionGroupId: string | null | undefined
    ): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        const targetId = optionGroupId || undefined;

        this.store.updateRule(conditionId, {
            targetId,
            condition: {
                ...condition.condition,
                optionGroupId: targetId,
            },
        });
    }

    updateConditionOrderType(
        conditionId: string,
        orderType: ProductRuleOrderType | null | undefined
    ): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        this.store.updateRule(conditionId, {
            condition: {
                ...condition.condition,
                orderType: orderType || undefined,
            },
        });
    }

    toggleConditionDay(conditionId: string, day: ProductRuleDay, checked: boolean): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        const days = new Set(condition.condition.daysOfWeek ?? []);

        if (checked) {
            days.add(day);
        } else {
            days.delete(day);
        }

        this.store.updateRule(conditionId, {
            condition: {
                ...condition.condition,
                daysOfWeek: [...days],
            },
        });
    }

    isConditionDaySelected(condition: ProductRuleDraft, day: ProductRuleDay): boolean {
        return (condition.condition.daysOfWeek ?? []).includes(day);
    }

    updateConditionTimeFrom(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.patchCondition(conditionId, {
            timeFrom: this.toOptionalString(value),
        });
    }

    updateConditionTimeTo(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.patchCondition(conditionId, {
            timeTo: this.toOptionalString(value),
        });
    }

    updateConditionAvailable(conditionId: string, available: boolean): void {
        this.patchAction(conditionId, {available});
    }

    updateConditionVisible(conditionId: string, visible: boolean): void {
        this.patchAction(conditionId, {visible});
    }

    updateConditionRequired(conditionId: string, required: boolean): void {
        this.patchAction(conditionId, {required});
    }

    updateConditionMinSelections(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.patchAction(conditionId, {
            minSelections: this.toPositiveInteger(value, 0),
        });
    }

    updateConditionMaxSelections(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.patchAction(conditionId, {
            maxSelections: this.toPositiveInteger(value, 0),
        });
    }

    updateConditionIncludedSelections(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.patchAction(conditionId, {
            includedSelections: this.toPositiveInteger(value, 0),
        });
    }

    updateConditionPriceDelta(
        conditionId: string,
        value: string | number | null | undefined
    ): void {
        this.patchAction(conditionId, {
            priceDeltaOverride: this.toMoney(value),
        });
    }

    conditionSummary(condition: ProductRuleDraft): string {
        const whenParts: string[] = [];

        if (condition.condition.daysOfWeek?.length) {
            whenParts.push(
                this.translate.instant('adminProductWizard.conditions.timing.selectedDays')
            );
        }

        if (condition.condition.timeFrom || condition.condition.timeTo) {
            whenParts.push(
                this.translate.instant('adminProductWizard.conditions.timing.timeRange', {
                    from: condition.condition.timeFrom ?? '--:--',
                    to: condition.condition.timeTo ?? '--:--',
                })
            );
        }

        if (condition.condition.orderType) {
            whenParts.push(
                condition.condition.orderType === 'DELIVERY'
                    ? this.translate.instant('adminProductWizard.conditions.timing.delivery')
                    : this.translate.instant('adminProductWizard.conditions.timing.pickup')
            );
        }

        return whenParts.length
            ? whenParts.join(' · ')
            : this.translate.instant('adminProductWizard.conditions.always');
    }

    private describeConditionTarget(condition: ProductRuleDraft): string {
        if (condition.targetType === 'VARIANT') {
            const variant = this.draft().variants.find(
                (item) => item.id === condition.targetId || item.id === condition.condition.variantId
            );

            return variant
                ? this.translate.instant('adminProductWizard.conditions.summary.targetVariant', {
                    name: variant.name,
                })
                : this.translate.instant('adminProductWizard.conditions.summary.targetSelectedVariant');
        }

        if (condition.targetType === 'OPTION_GROUP') {
            const choice = this.selectedFormatChoices().find(
                (item) => item.optionGroupId === condition.targetId || item.optionGroupId === condition.condition.optionGroupId
            );

            return choice
                ? this.translate.instant('adminProductWizard.conditions.summary.targetChoice', {
                    name: choice.name,
                })
                : this.translate.instant('adminProductWizard.conditions.summary.targetSelectedChoice');
        }

        return this.translate.instant('adminProductWizard.conditions.summary.targetProduct');
    }

    private describeConditionTiming(condition: ProductRuleDraft): string {
        const parts: string[] = [];

        if (condition.condition.variantId && condition.targetType !== 'VARIANT') {
            const variant = this.draft().variants.find(
                (item) => item.id === condition.condition.variantId
            );

            if (variant) {
                parts.push(
                    this.translate.instant('adminProductWizard.conditions.timing.forFormat', {
                        name: variant.name,
                    })
                );
            }
        }

        if (condition.condition.daysOfWeek?.length) {
            parts.push(
                this.translate.instant('adminProductWizard.conditions.timing.selectedDays')
            );
        }

        if (condition.condition.timeFrom || condition.condition.timeTo) {
            parts.push(
                this.translate.instant('adminProductWizard.conditions.timing.timeRange', {
                    from: condition.condition.timeFrom ?? '--:--',
                    to: condition.condition.timeTo ?? '--:--',
                })
            );
        }

        if (condition.condition.orderType === 'DELIVERY') {
            parts.push(this.translate.instant('adminProductWizard.conditions.timing.delivery'));
        }

        if (condition.condition.orderType === 'PICKUP') {
            parts.push(this.translate.instant('adminProductWizard.conditions.timing.pickup'));
        }

        return parts.length
            ? parts.join(', ')
            : this.translate.instant('adminProductWizard.conditions.timing.allTime');
    }

    private patchCondition(
        conditionId: string,
        patch: Partial<ProductRuleConditionDraft>
    ): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        this.store.updateRule(conditionId, {
            condition: {
                ...condition.condition,
                ...patch,
            },
        });
    }

    private patchAction(
        conditionId: string,
        patch: Partial<ProductRuleActionDraft>
    ): void {
        const condition = this.findCondition(conditionId);
        if (!condition) return;

        this.store.updateRule(conditionId, {
            action: {
                ...condition.action,
                ...patch,
            },
        });
    }

    private findCondition(conditionId: string): ProductRuleDraft | undefined {
        return this.draft().rules.find((condition) => condition.id === conditionId);
    }

    private createDefaultConditionLabel(type: ProductRuleType): string {
        switch (type) {
            case 'AVAILABILITY':
                return this.translate.instant('adminProductWizard.conditions.defaultLabels.availability');
            case 'VISIBILITY':
                return this.translate.instant('adminProductWizard.conditions.defaultLabels.visibility');
            case 'SELECTION_RULE':
                return this.translate.instant('adminProductWizard.conditions.defaultLabels.selection');
            case 'INCLUDED_OPTION':
                return this.translate.instant('adminProductWizard.conditions.defaultLabels.included');
            case 'PRICE_RULE':
                return this.translate.instant('adminProductWizard.conditions.defaultLabels.price');
        }
    }

    private createDefaultConditionAction(type: ProductRuleType): ProductRuleActionDraft {
        switch (type) {
            case 'AVAILABILITY':
                return {available: true};
            case 'VISIBILITY':
                return {visible: true};
            case 'SELECTION_RULE':
                return {required: true, minSelections: 1, maxSelections: 1};
            case 'INCLUDED_OPTION':
                return {includedSelections: 1};
            case 'PRICE_RULE':
                return {priceDeltaOverride: 0};
        }
    }

    private toOptionalString(value: string | number | null | undefined): string | undefined {
        const text = String(value ?? '').trim();
        return text.length > 0 ? text : undefined;
    }

    private toMoney(value: string | number | null | undefined): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            return 0;
        }

        return Math.round(parsed * 100) / 100;
    }

    private toProductRuleType(value: ProductRuleType | string | null | undefined): ProductRuleType {
        switch (value) {
            case 'AVAILABILITY':
            case 'VISIBILITY':
            case 'INCLUDED_OPTION':
            case 'PRICE_RULE':
            case 'SELECTION_RULE':
                return value;
            default:
                return 'AVAILABILITY';
        }
    }

    trackById = (_: number, item: { id: string }): string => item.id;

    async openExistingChoiceConfiguration(choice: ProductChoiceDraft): Promise<void> {
        const configurationModal = await this.modalController.create({
            component: ProductChoiceConfigurationModal,
            componentProps: {
                choice: {
                    id: choice.optionGroupId ?? choice.id,
                    name: choice.name,
                    description: undefined,
                    required: choice.required,
                    minSelections: choice.minSelections,
                    maxSelections: choice.maxSelections,
                    usedInProductCount: undefined,
                    items: choice.items,
                },
                nextDisplayOrder: choice.displayOrder,
            },
            cssClass: 'product-choice-configuration-modal',
        });

        await configurationModal.present();

        const configurationResult = await configurationModal.onDidDismiss<ChoiceConfigurationResult>();

        if (configurationResult.role !== 'configured' || !configurationResult.data) {
            return;
        }

        this.store.updateChoice(choice.id, configurationResult.data);
    }

    async openCategoryPicker(): Promise<void> {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        const modal = await this.modalController.create({
            component: ProductCategoryPickerModal,
            componentProps: {
                categories: this.store.categories(),
                selectedCategoryIds: this.draft().categoryIds,
            },
            cssClass: 'product-category-picker-modal',
            ...(isMobile
                ? {breakpoints: [0, 0.92], initialBreakpoint: 0.92, handle: true}
                : {handle: false}),
        });

        await modal.present();

        const result = await modal.onDidDismiss<ProductCategoryPickerResult>();

        if (!result.data) return;

        if (result.role === 'confirm' && 'categoryIds' in result.data) {
            this.store.selectCategories(result.data.categoryIds);
            return;
        }

        if (result.role === 'create' && 'name' in result.data) {
            const createdCategory = await this.facade.createCategory(result.data.name);
            this.store.selectCategories([...result.data.categoryIds, createdCategory.id]);
        }
    }

    private async openChoiceConfiguration(choice: OptionGroupLibraryItem): Promise<void> {
        const configuration = await this.openVariantChoiceConfiguration(
            choice,
            this.draft().choices.length
        );

        if (!configuration) {
            return;
        }

        this.store.addChoiceFromLibrary(choice.id, configuration);
    }

    private async openVariantChoiceConfiguration(
        choice: OptionGroupLibraryItem,
        nextDisplayOrder: number
    ): Promise<ChoiceConfigurationResult | null> {
        const configurationModal = await this.modalController.create({
            component: ProductChoiceConfigurationModal,
            componentProps: {
                choice,
                nextDisplayOrder,
            },
            cssClass: 'product-choice-configuration-modal',
        });

        await configurationModal.present();

        const configurationResult = await configurationModal.onDidDismiss<ChoiceConfigurationResult>();

        if (configurationResult.role !== 'configured' || !configurationResult.data) {
            return null;
        }

        return configurationResult.data;
    }

    private findChoice(choiceId: string): ProductChoiceDraft | undefined {
        return this.draft().choices.find((choice) => choice.id === choiceId);
    }

    private getAvailableOptionCount(choice: ProductChoiceDraft): number {
        return choice.items.filter((item) => item.isAvailable).length;
    }

    private setChoiceMessage(
        choiceId: string,
        field: keyof ChoiceFieldMessages,
        messageKey: string | null
    ): void {
        this.choiceFieldMessagesSignal.update((messages) => ({
            ...messages,
            [choiceId]: {
                ...messages[choiceId],
                [field]: messageKey,
            },
        }));
    }

    private clearChoiceMessages(choiceId: string): void {
        this.choiceFieldMessagesSignal.update((messages) => ({
            ...messages,
            [choiceId]: {min: null, max: null},
        }));
    }

    private toPositiveInteger(value: string | number | null | undefined, fallback: number): number {
        if (value === null || value === undefined || value === '') return fallback;
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.max(0, Math.floor(parsed));
    }
}
