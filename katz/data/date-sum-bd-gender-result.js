var genderData = [{"count": 6, "age": 18, "male": {"count": 5, "sum": 2800}, "sum": 2850, "female": {"count": 1, "sum": 50}}, {"count": 14, "age": 19, "male": {"count": 11, "sum": 11726}, "sum": 13676, "female": {"count": 3, "sum": 1950}}, {"count": 11, "age": 20, "male": {"count": 8, "sum": 8410}, "sum": 11934, "female": {"count": 3, "sum": 3524}}, {"count": 33, "age": 21, "male": {"count": 30, "sum": 53964}, "sum": 56464, "female": {"count": 3, "sum": 2500}}, {"count": 27, "age": 22, "male": {"count": 18, "sum": 31697}, "sum": 39047, "female": {"count": 9, "sum": 7350}}, {"count": 87, "age": 23, "male": {"count": 79, "sum": 122812}, "sum": 132062, "female": {"count": 8, "sum": 9250}}, {"count": 106, "age": 24, "male": {"count": 99, "sum": 228920}, "sum": 238278, "female": {"count": 7, "sum": 9358}}, {"count": 183, "age": 25, "male": {"count": 158, "sum": 344575}, "sum": 415492, "female": {"count": 25, "sum": 70917}}, {"count": 162, "age": 26, "male": {"count": 136, "sum": 271972}, "sum": 375436, "female": {"count": 26, "sum": 103464}}, {"count": 189, "age": 27, "male": {"count": 164, "sum": 332020}, "sum": 386673, "female": {"count": 25, "sum": 54653}}, {"count": 165, "age": 28, "male": {"count": 144, "sum": 248447}, "sum": 395497, "female": {"count": 21, "sum": 147050}}, {"count": 171, "age": 29, "male": {"count": 154, "sum": 311826}, "sum": 355676, "female": {"count": 17, "sum": 43850}}, {"count": 185, "age": 30, "male": {"count": 172, "sum": 466726}, "sum": 591489, "female": {"count": 13, "sum": 124763}}, {"count": 155, "age": 31, "male": {"count": 140, "sum": 337476}, "sum": 482286, "female": {"count": 15, "sum": 144810}}, {"count": 148, "age": 32, "male": {"count": 130, "sum": 444311}, "sum": 475111, "female": {"count": 18, "sum": 30800}}, {"count": 141, "age": 33, "male": {"count": 126, "sum": 404577}, "sum": 440677, "female": {"count": 15, "sum": 36100}}, {"count": 89, "age": 34, "male": {"count": 65, "sum": 194946}, "sum": 265406, "female": {"count": 24, "sum": 70460}}, {"count": 85, "age": 35, "male": {"count": 76, "sum": 334112}, "sum": 342384, "female": {"count": 9, "sum": 8272}}, {"count": 85, "age": 36, "male": {"count": 79, "sum": 220826}, "sum": 242056, "female": {"count": 6, "sum": 21230}}, {"count": 75, "age": 37, "male": {"count": 63, "sum": 207245}, "sum": 233645, "female": {"count": 12, "sum": 26400}}, {"count": 52, "age": 38, "male": {"count": 47, "sum": 111915}, "sum": 121915, "female": {"count": 5, "sum": 10000}}, {"count": 58, "age": 39, "male": {"count": 49, "sum": 156208}, "sum": 163778, "female": {"count": 9, "sum": 7570}}, {"count": 30, "age": 40, "male": {"count": 23, "sum": 34599}, "sum": 87699, "female": {"count": 7, "sum": 53100}}, {"count": 18, "age": 41, "male": {"count": 14, "sum": 28500}, "sum": 66500, "female": {"count": 4, "sum": 38000}}, {"count": 37, "age": 42, "male": {"count": 36, "sum": 124628}, "sum": 125628, "female": {"count": 1, "sum": 1000}}, {"count": 32, "age": 43, "male": {"count": 32, "sum": 77158}, "sum": 77158, "female": {"count": 0, "sum": 0}}, {"count": 28, "age": 44, "male": {"count": 24, "sum": 49352}, "sum": 114352, "female": {"count": 4, "sum": 65000}}, {"count": 14, "age": 45, "male": {"count": 12, "sum": 15600}, "sum": 35600, "female": {"count": 2, "sum": 20000}}, {"count": 2, "age": 46, "male": {"count": 0, "sum": 0}, "sum": 7900, "female": {"count": 2, "sum": 7900}}, {"count": 11, "age": 47, "male": {"count": 8, "sum": 13500}, "sum": 22000, "female": {"count": 3, "sum": 8500}}, {"count": 8, "age": 48, "male": {"count": 8, "sum": 19950}, "sum": 19950, "female": {"count": 0, "sum": 0}}, {"count": 6, "age": 49, "male": {"count": 4, "sum": 69313}, "sum": 73313, "female": {"count": 2, "sum": 4000}}, {"count": 8, "age": 50, "male": {"count": 6, "sum": 38772}, "sum": 41772, "female": {"count": 2, "sum": 3000}}, {"count": 9, "age": 51, "male": {"count": 8, "sum": 50400}, "sum": 51400, "female": {"count": 1, "sum": 1000}}, {"count": 11, "age": 52, "male": {"count": 7, "sum": 86500}, "sum": 96000, "female": {"count": 4, "sum": 9500}}, {"count": 10, "age": 53, "male": {"count": 9, "sum": 17100}, "sum": 22100, "female": {"count": 1, "sum": 5000}}, {"count": 7, "age": 54, "male": {"count": 4, "sum": 8000}, "sum": 14000, "female": {"count": 3, "sum": 6000}}, {"count": 4, "age": 55, "male": {"count": 1, "sum": 1000}, "sum": 7750, "female": {"count": 3, "sum": 6750}}, {"count": 4, "age": 56, "male": {"count": 2, "sum": 1600}, "sum": 13854, "female": {"count": 2, "sum": 12254}}, {"count": 4, "age": 57, "male": {"count": 2, "sum": 1500}, "sum": 2344, "female": {"count": 2, "sum": 844}}, {"count": 6, "age": 58, "male": {"count": 0, "sum": 0}, "sum": 115200, "female": {"count": 6, "sum": 115200}}, {"count": 4, "age": 59, "male": {"count": 1, "sum": 1000}, "sum": 17000, "female": {"count": 3, "sum": 16000}}, {"count": 3, "age": 60, "male": {"count": 0, "sum": 0}, "sum": 800, "female": {"count": 3, "sum": 800}}, {"count": 4, "age": 61, "male": {"count": 3, "sum": 2750}, "sum": 3250, "female": {"count": 1, "sum": 500}}, {"count": 1, "age": 62, "male": {"count": 1, "sum": 300}, "sum": 300, "female": {"count": 0, "sum": 0}}, {"count": 2, "age": 63, "male": {"count": 2, "sum": 4000}, "sum": 4000, "female": {"count": 0, "sum": 0}}, {"count": 1, "age": 64, "male": {"count": 1, "sum": 2500}, "sum": 2500, "female": {"count": 0, "sum": 0}}, {"count": 2, "age": 65, "male": {"count": 0, "sum": 0}, "sum": 2000, "female": {"count": 2, "sum": 2000}}, {"count": 10, "age": 66, "male": {"count": 7, "sum": 41000}, "sum": 46000, "female": {"count": 3, "sum": 5000}}, {"count": 0, "age": 67, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 3, "age": 68, "male": {"count": 0, "sum": 0}, "sum": 1450, "female": {"count": 3, "sum": 1450}}, {"count": 0, "age": 69, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 7, "age": 70, "male": {"count": 2, "sum": 2000}, "sum": 7000, "female": {"count": 5, "sum": 5000}}, {"count": 0, "age": 71, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 0, "age": 72, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 0, "age": 73, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 2, "age": 74, "male": {"count": 0, "sum": 0}, "sum": 1000, "female": {"count": 2, "sum": 1000}}, {"count": 0, "age": 75, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 0, "age": 76, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 1, "age": 77, "male": {"count": 0, "sum": 0}, "sum": 20000, "female": {"count": 1, "sum": 20000}}, {"count": 0, "age": 78, "male": {"count": 0, "sum": 0}, "sum": 0, "female": {"count": 0, "sum": 0}}, {"count": 1, "age": 79, "male": {"count": 1, "sum": 1000}, "sum": 1000, "female": {"count": 0, "sum": 0}}];