import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { LiveEntity } from "./LiveEntity";

@Entity("tags")
export class TagEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  name: string;

  /*   @ManyToMany(() => LiveEntity, (live) => live.tags)
  lives: LiveEntity[]; */

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
