import { IsOptional } from 'class-validator';
import { User } from '../../auth/entities/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';


@Entity({ name: 'products' })
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

  @ManyToOne(
    () => User,
    ( user ) => user.product,
    { eager : true }
  )
  user: User

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
