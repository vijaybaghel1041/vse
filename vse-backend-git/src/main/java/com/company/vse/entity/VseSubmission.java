package com.company.vse.entity;

import jakarta.persistence.Id;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

@Entity
@Table(name = "vse_submission")
public class VseSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeId;
    private String goalsAchieved;
    private String selfRating;
    private Integer year;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
	}
	public String getGoalsAchieved() {
		return goalsAchieved;
	}
	public void setGoalsAchieved(String goalsAchieved) {
		this.goalsAchieved = goalsAchieved;
	}
	public String getSelfRating() {
		return selfRating;
	}
	public void setSelfRating(String selfRating) {
		this.selfRating = selfRating;
	}
	public Integer getYear() {
		return year;
	}
	public void setYear(Integer year) {
		this.year = year;
	}

    // getters & setters
    
}
