import * as fs from "fs";
import { IUserSchema } from "../../../schemas/User";
import Base64ToImage from "../../../modules/Base64-To-Image";
import { Request, Response, NextFunction } from "express";
import SendRule, { HTTPRequestCode, StatusError } from "../../../modules/Send-Rule";
import { IClubSchema } from "../../../schemas/Club";


export const ChangeClubImage = (req: Request, res: Response, next: NextFunction) => {
	let user: IUserSchema = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let imageData = req.body.img as string; // img
	if (club.checkAdmin(user)) {
		if (imageData) {
			let data = Base64ToImage.getImageData(imageData);
			if (club.imgPath != "") {
				try {
					fs.unlinkSync(`public/${club.imgPath}`);
				} catch (err) {
					next(err);
				}
			}
			club.imgPath = `club/${club._id}.${data.imgType}`;
			fs.writeFile(`public/${club.imgPath}`, data.imgFile, err => {
				if (err) next(err);
				club.save()
					.then(user => {
						SendRule.response(res, HTTPRequestCode.CREATE, user, "동아리 대표 사진 수정 성공");
					})
					.catch(err => next(err));
			});
		} else {
			next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
		}
	} else {
		return SendRule.response(res, HTTPRequestCode.FORBIDDEN, undefined, "권한 없음");
	}
};
