import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('Configs')
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  gameId: string;

  @Column()
  isMaintenance: number;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @DeleteDateColumn()
  deletedAt;

}