import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


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

}
