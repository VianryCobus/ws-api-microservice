import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Transaction } from "./transaction.entity";
import { Wallet } from "./wallet.entity";

@Entity('Balances')
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  balance: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.balances)
  @JoinColumn()
  wallet: Wallet

  @OneToOne(() => Transaction, (transaction) => transaction.balance)
  @JoinColumn()
  transaction: Transaction

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}