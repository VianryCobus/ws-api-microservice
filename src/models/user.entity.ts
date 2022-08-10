import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Agent } from "./agent.entity";
import { Client } from "./client.entity";
import { Transaction } from "./transaction.entity";
import { Wallet } from "./wallet.entity";

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  userAgentId: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  hash: string;

  @Column({
    nullable: true,
  })
  mode: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  playerToken: string;

  // @ManyToOne(() => Agent, (agent) => agent.users)
  // @JoinColumn()
  // agent: Agent

  @ManyToOne(() => Client, (client) => client.users)
  @JoinColumn()
  client: Client

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[]

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
  })
  wallet: Wallet

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}