import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Currency } from "./currency.entity";
import { User } from "./user.entity";

@Entity('Agents')
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  agentId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  apiKey: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  agentKey: string;

  @OneToMany(() => User, (user) => user.agent)
  users: User[]

  @ManyToOne(() => Currency, (currency) => currency.agents)
  @JoinColumn()
  currency: Currency

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @DeleteDateColumn()
  deletedAt;
}