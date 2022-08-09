import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('HistoryLogins')
export class HistoryLogin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ip: string;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @DeleteDateColumn()
  deletedAt;
}