import { IsOptional } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';


@Entity()
export class Product {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**TITLE */
  @Column('text', {
    unique: true
  })
  title: string;

  /**PRICE */
  @Column('float', {
    default: 0
  })
  price: number

  /**DESCRIPTION */
  @Column({
    type: 'text',
    nullable: true
  })
  description: string;
  
  /**SLUG */
  @Column('text', {
    unique:true
  })
  slug: string;

  /**STOCK */
  @Column('int', {
    default: 0
  })
  stock: number;
  
  /**SIZES */
  @Column('text', {
    array: true
  })
  sizes: string[];

  /***GENDER*****/
  @Column('text')
  gender: string;

  /**TAGS */
  @Column('text', {
    array: true,
    default: []
  })
  tags: string[];

  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @BeforeInsert()
  checkSlugInsert(){
    
    if ( !this.slug ) {
      this.slug = this.title;  
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ','-')
      .replaceAll("'",'')
  }

  @BeforeUpdate()
  checkSlugUpdate(){
    this.slug = this.slug
    .toLowerCase()
    .replaceAll(' ','-')
    .replaceAll("'",'')
  }

}
