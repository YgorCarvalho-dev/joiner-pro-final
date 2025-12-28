-- AlterTable
ALTER TABLE `insumos` ADD COLUMN `precoCusto` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `projeto` MODIFY `descricao` TEXT NULL;
