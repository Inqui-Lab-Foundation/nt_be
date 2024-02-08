
import { NextFunction, Request, Response } from "express";;
import BaseController from "./base.controller";
import dispatcher from "../utils/dispatch.util";
import { speeches } from "../configs/speeches.config";
import { themes_problems } from "../models/themes_problems.model";

export default class themes_problemsController extends BaseController {

    model = "themes_problems";

    protected initializePath(): void {
        this.path = '/themes_problems';
    }
    protected initializeRoutes(): void {
        this.router.get(this.path + "/getthemes", this.getThemes.bind(this));
        this.router.get(this.path + "/getproblemstatement", this.getProblemStatement.bind(this));
        super.initializeRoutes();
    }
    protected async getThemes(req: Request, res: Response, next: NextFunction) {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let response: any = [];
            const result = await this.crudService.findAll(themes_problems, {
                attributes: [
                    'theme_name'
                ],
                where: {
                    status: 'ACTIVE'
                },
                group: ['theme_name'],
                order: ['theme_name']
            });
            result.forEach((obj: any) => {
                response.push(obj.dataValues.theme_name)
            });
            res.status(200).send(dispatcher(res, response))
        } catch (err) {
            next(err)
        }
    }
    protected async getProblemStatement(req: Request, res: Response, next: NextFunction) {
        if (res.locals.role !== 'ADMIN' && res.locals.role !== 'STUDENT') {
            return res.status(401).send(dispatcher(res, '', 'error', speeches.ROLE_ACCES_DECLINE, 401));
        }
        try {
            let newREQQuery : any = {}
            if(req.query.Data){
                let newQuery : any = await this.authService.decryptGlobal(req.query.Data);
                newREQQuery  = JSON.parse(newQuery);
            }else if(Object.keys(req.query).length !== 0){
                return res.status(400).send(dispatcher(res,'','error','Bad Request',400));
            }
            const theme_name = newREQQuery.theme_name;
            let response: any = [];
            const result = await this.crudService.findAll(themes_problems, {
                attributes: [
                    'problem_statement',
                    'theme_problem_id',
                    'problem_statement_description'
                ],
                where: {
                    status: 'ACTIVE',
                    theme_name:theme_name
                },
                group: ['problem_statement'],
                order: ['theme_problem_id']
            });
            result.forEach((obj: any) => {
                response.push({problem_statement:obj.dataValues.problem_statement,theme_problem_id:obj.dataValues.theme_problem_id,problem_statement_description:obj.dataValues.problem_statement_description})
            });
            res.status(200).send(dispatcher(res, response))
        } catch (err) {
            next(err)
        }
    }

}