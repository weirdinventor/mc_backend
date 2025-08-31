import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recipients')
export class RecipientEntity {
  @PrimaryColumn({
    type: 'varchar',
  })
  id: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
    unique: true,
    type: 'varchar',
  })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



