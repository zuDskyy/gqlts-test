
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './Users';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class Post extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  text!: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: "int", default: 0 })
  points!: number;

  @Field(() => Int, {nullable:true} )
  voteStatus: number | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  creatorId: number;

  @Field()
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @ManyToOne(() => Updoot, updoot => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;


} 