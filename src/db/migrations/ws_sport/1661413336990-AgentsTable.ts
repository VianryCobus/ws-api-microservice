import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class AgentsTable1661413336990 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "Agents",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "agentId",
                        type: "varchar",
                        length: "255",
                        isUnique: true,
                    },
                    {
                        name: "apiKey",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "currencyId",
                        type: "int",
                    },
                    {
                        name: "username",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "agentKey",
                        type: "varchar",
                        length: "255",
                    }
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("Agents")
    }

}
