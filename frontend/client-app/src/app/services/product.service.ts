import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly mockProducts: Product[] = [
    {
      id: '1',
      sku: 'PIZZA-MARGHERITA',
      slug: 'pizza-margherita',
      title: 'Pizza Margherita',
      shortDescription: 'Tomato, mozzarella, basil',
      description: 'Classic Italian pizza with tomato sauce, mozzarella and fresh basil.',
      isAvailable: true,
      isFeatured: true,
      category: {
        id: 'pizza',
        name: 'Pizza',
        slug: 'pizza',
      },
      thumb: 'https://picsum.photos/600/400?1',
      images: [
        {
          id: 'img-1',
          url: 'https://picsum.photos/600/400?1',
          alt: 'Pizza Margherita',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: 'pizza-small',
          name: 'Small',
          basePrice: 14,
          isDefault: true,
          isAvailable: true,
          sortOrder: 1,
        },
        {
          id: 'pizza-medium',
          name: 'Medium',
          basePrice: 18,
          compareAtPrice: 20,
          isAvailable: true,
          sortOrder: 2,
        },
        {
          id: 'pizza-large',
          name: 'Large',
          basePrice: 22,
          isAvailable: true,
          sortOrder: 3,
        },
      ],
      optionGroups: [
        {
          id: 'pizza-dough',
          name: 'Dough',
          description: 'Choose your dough type',
          displayType: 'radio',
          required: true,
          multiple: false,
          minSelect: 1,
          maxSelect: 1,
          isAvailable: true,
          sortOrder: 1,
          options: [
            {
              id: 'thin-dough',
              name: 'Thin dough',
              priceDelta: 0,
              isDefault: true,
              isAvailable: true,
              sortOrder: 1,
            },
            {
              id: 'thick-dough',
              name: 'Thick dough',
              priceDelta: 1,
              isAvailable: true,
              sortOrder: 2,
            },
          ],
        },
        {
          id: 'pizza-extras',
          name: 'Extras',
          description: 'Add extra toppings',
          displayType: 'checkbox',
          required: false,
          multiple: true,
          minSelect: 0,
          maxSelect: 4,
          isAvailable: true,
          sortOrder: 2,
          options: [
            {
              id: 'extra-cheese',
              name: 'Extra cheese',
              priceDelta: 2,
              isAvailable: true,
              sortOrder: 1,
            },
            {
              id: 'olives',
              name: 'Olives',
              priceDelta: 1.5,
              isAvailable: true,
              sortOrder: 2,
            },
            {
              id: 'mushrooms',
              name: 'Mushrooms',
              priceDelta: 2,
              isAvailable: true,
              sortOrder: 3,
            },
          ],
        },
      ],
      reviews: [
        { rating: 5, comment: 'Excellent', authorName: 'Sofia' },
        { rating: 4, comment: 'Very good', authorName: 'Luca' },
      ],
      preparationTimeMinutes: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      sku: 'BURGER-CLASSIC',
      slug: 'burger-classic',
      title: 'Burger Classic',
      shortDescription: 'Beef, cheese, salad',
      description: 'Juicy beef burger with cheddar, salad and tomato.',
      isAvailable: true,
      category: {
        id: 'burger',
        name: 'Burger',
        slug: 'burger',
      },
      thumb: 'https://picsum.photos/600/400?2',
      images: [
        {
          id: 'img-2',
          url: 'https://picsum.photos/600/400?2',
          alt: 'Burger Classic',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          id: 'single',
          name: 'Single',
          basePrice: 15,
          isDefault: true,
          isAvailable: true,
          sortOrder: 1,
        },
        {
          id: 'double',
          name: 'Double',
          basePrice: 19,
          isAvailable: true,
          sortOrder: 2,
        },
      ],
      optionGroups: [
        {
          id: 'burger-cooking',
          name: 'Cooking',
          description: 'Choose the cooking level',
          displayType: 'radio',
          required: true,
          multiple: false,
          minSelect: 1,
          maxSelect: 1,
          isAvailable: true,
          sortOrder: 1,
          options: [
            {
              id: 'medium',
              name: 'Medium',
              priceDelta: 0,
              isDefault: true,
              isAvailable: true,
              sortOrder: 1,
            },
            {
              id: 'well-done',
              name: 'Well done',
              priceDelta: 0,
              isAvailable: true,
              sortOrder: 2,
            },
          ],
        },
        {
          id: 'burger-extras',
          name: 'Extras',
          description: 'Choose your extras',
          displayType: 'checkbox',
          required: false,
          multiple: true,
          minSelect: 0,
          maxSelect: 3,
          isAvailable: true,
          sortOrder: 2,
          options: [
            {
              id: 'bacon',
              name: 'Bacon',
              priceDelta: 2.5,
              isAvailable: true,
              sortOrder: 1,
            },
            {
              id: 'extra-sauce',
              name: 'Extra sauce',
              priceDelta: 1,
              isAvailable: true,
              sortOrder: 2,
            },
            {
              id: 'extra-cheddar',
              name: 'Extra cheddar',
              priceDelta: 2,
              isAvailable: true,
              sortOrder: 3,
            },
          ],
        },
      ],
      reviews: [
        { rating: 4, comment: 'Good burger', authorName: 'Emma' },
        { rating: 4, comment: 'Tasty', authorName: 'Noah' },
      ],
      preparationTimeMinutes: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      sku: 'PASTA-CARBONARA',
      slug: 'pasta-carbonara',
      title: 'Pasta Carbonara',
      shortDescription: 'Cream, bacon, parmesan',
      description: 'Traditional creamy carbonara with crispy bacon.',
      isAvailable: true,
      category: {
        id: 'pasta',
        name: 'Pasta',
        slug: 'pasta',
      },
      thumb: 'https://picsum.photos/600/400?3',
      images: [
        {
          id: 'img-3',
          url: 'https://picsum.photos/600/400?3',
          alt: 'Pasta Carbonara',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      basePrice: 17,
      optionGroups: [
        {
          id: 'pasta-extras',
          name: 'Extras',
          displayType: 'checkbox',
          required: false,
          multiple: true,
          minSelect: 0,
          maxSelect: 2,
          isAvailable: true,
          sortOrder: 1,
          options: [
            {
              id: 'extra-parmesan',
              name: 'Extra parmesan',
              priceDelta: 1.5,
              isAvailable: true,
              sortOrder: 1,
            },
            {
              id: 'extra-bacon',
              name: 'Extra bacon',
              priceDelta: 2.5,
              isAvailable: true,
              sortOrder: 2,
            },
          ],
        },
      ],
      reviews: [
        { rating: 5, comment: 'Amazing', authorName: 'Leo' },
      ],
      preparationTimeMinutes: 14,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  getAllProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return of(
      this.mockProducts.filter((product) => product.category?.id === categoryId)
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return of(this.mockProducts.find((product) => product.id === id));
  }
}
