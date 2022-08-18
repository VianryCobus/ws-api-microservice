import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { HistoryBalancePlayersMysqlHL } from "./historyBalancePlayers.entity";

@Entity('master_players')
export class MasterPlayersMysqlHl {
  @PrimaryGeneratedColumn()
  id_players: number;

  @Column()
  username_players: string;

  @Column()
  userid_players: string;

  @OneToMany(() => HistoryBalancePlayersMysqlHL, (hbpmh) => hbpmh.mpmh)
  @JoinColumn({ name:"id_players",referencedColumnName:"players_id" })
  hbpmh: HistoryBalancePlayersMysqlHL[]

}